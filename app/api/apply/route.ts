import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notify } from '@/lib/notificationEngine'
import { calculateMatchScore } from '@/lib/matchEngine'

export async function POST(req: NextRequest) {
  try {
    const { jobId, applicantId, cvJobId, rawResumeText, fileName, coverLetter, whyRole } = await req.json()

    if (!jobId || !applicantId) {
      return NextResponse.json({ error: 'Missing required parameters: jobId and applicantId' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch job listing with recruiter info
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, recruiter_profiles(*)')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 })
    }

    // 2. Fetch applicant profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', applicantId)
      .single()

    // 3. Determine CV source & calculate ATS Match Score
    let cvJobObject: any = null
    if (cvJobId) {
      const { data: cvJob } = await supabase
        .from('cv_jobs')
        .select('*')
        .eq('id', cvJobId)
        .single()

      if (cvJob) cvJobObject = cvJob
    } else if (rawResumeText) {
      cvJobObject = {
        raw_text: rawResumeText,
        resume_text: rawResumeText,
        fileName: fileName || 'Uploaded_Resume.pdf'
      }
    }

    const matchResult = calculateMatchScore(job, cvJobObject)
    const matchScore = matchResult.score !== null ? matchResult.score : 0
    const matchedKeywords = matchResult.matchedKeywords || []
    const missingKeywords = matchResult.missingKeywords || []

    // 4. Insert into job_applications table
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        applicant_id: applicantId,
        cv_job_id: cvJobId || null,
        cover_letter: coverLetter || null,
        match_score: matchScore,
        status: 'applied'
      })
      .select()
      .single()

    if (appError) {
      if (appError.code === '23505') {
        return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 })
      }
      throw appError
    }

    // 5. Increment applications count on job
    await supabase
      .from('jobs')
      .update({ applications_count: (job.applications_count || 0) + 1 })
      .eq('id', jobId)

    const applicantName = profile?.full_name || profile?.email || 'Applicant'
    const applicantEmail = profile?.email || ''
    const recruiterTargetEmail = job.application_email || job.recruiter_profiles?.email

    // 6. Send applicant confirmation notification
    await notify({
      userId: applicantId,
      type: 'application_update',
      title: 'Application Submitted!',
      body: `Your application to ${job.company_name} for ${job.title} has been received.`,
      data: { job_id: jobId, application_id: application.id },
      email: applicantEmail ? {
        to: applicantEmail,
        subject: `Application Confirmed: ${job.title} at ${job.company_name}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
            <div style="background: #0B132B; padding: 28px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; tracking: -0.5px;">SOPHI <span style="color: #E5A93C;">CAREERS</span></h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Application Confirmation</p>
            </div>
            <div style="padding: 24px; color: #1e293b;">
              <h2 style="font-size: 18px; margin-top: 0;">Application Submitted!</h2>
              <p style="font-size: 14px; color: #475569;">Hi ${applicantName},</p>
              <p style="font-size: 14px; color: #475569;">Your application for <strong style="color: #0f172a;">${job.title}</strong> at <strong style="color: #0f172a;">${job.company_name}</strong> has been received successfully.</p>
              
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
                <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Your Sophi ATS Match Score</div>
                <div style="font-size: 32px; font-weight: 900; color: #2563eb; margin: 6px 0;">${matchScore}%</div>
                <div style="font-size: 12px; color: #059669; font-weight: 600;">Submitted to Hiring Team</div>
              </div>

              <p style="font-size: 13px; color: #64748b;">You can track your application status anytime in your Sophi Careers dashboard.</p>
            </div>
          </div>
        `
      } : undefined
    })

    // 7. Send Premium Recruiter HTML Notification Draft
    if (job.recruiter_id || recruiterTargetEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sofi-career-portal.vercel.app'
      const recruiterDashboardUrl = `${siteUrl}/recruiter/dashboard`

      const matchedPills = matchedKeywords.slice(0, 8).map(
        (k: string) => `<span style="display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin: 2px 4px 4px 0;">✓ ${k}</span>`
      ).join('')

      const missingPills = missingKeywords.slice(0, 5).map(
        (k: string) => `<span style="display: inline-block; background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin: 2px 4px 4px 0;">! ${k}</span>`
      ).join('')

      const recruiterHtmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Job Application Received</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);">
            
            <!-- Sophi Header -->
            <div style="background: linear-gradient(135deg, #0B132B 0%, #1C2541 100%); padding: 32px 24px; text-align: center; color: #ffffff; border-bottom: 3px solid #E5A93C;">
              <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">SOPHI <span style="color: #E5A93C;">CAREERS</span></div>
              <div style="font-size: 11px; text-transform: uppercase; tracking: 0.1em; color: #94a3b8; font-weight: 700; margin-top: 4px;">Recruiter Hiring Intelligence</div>
            </div>

            <!-- Main Email Body -->
            <div style="padding: 28px 24px; color: #1e293b;">
              
              <div style="display: inline-block; padding: 5px 12px; background: #eff6ff; color: #1d4ed8; font-weight: 800; border-radius: 20px; font-size: 11px; text-transform: uppercase; tracking: 0.05em;">
                New Candidate Applied
              </div>

              <h2 style="margin: 12px 0 4px 0; font-size: 22px; font-weight: 900; color: #0f172a;">${applicantName}</h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748b; font-weight: 600;">
                Applied for <strong style="color: #1e293b;">${job.title}</strong> at <strong>${job.company_name}</strong>
              </p>

              <!-- ATS Match Gauge Card -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 20px 0; text-align: center;">
                <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Sophi AI Match Score</div>
                <div style="font-size: 42px; font-weight: 900; color: ${matchScore >= 80 ? '#059669' : matchScore >= 60 ? '#2563eb' : '#d97706'}; margin: 4px 0;">
                  ${matchScore}%
                </div>
                <div style="font-size: 12px; font-weight: 700; color: ${matchScore >= 80 ? '#047857' : matchScore >= 60 ? '#1d4ed8' : '#b45309'};">
                  ${matchScore >= 80 ? '🎯 Exceptional Skill Match' : matchScore >= 60 ? '⚡ Strong Potential Match' : '📋 Moderate Keyword Alignment'}
                </div>
              </div>

              <!-- Key Skills Breakdown -->
              ${matchedPills ? `
                <div style="margin-top: 20px;">
                  <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 8px;">Top Matched ATS Skills</div>
                  <div>${matchedPills}</div>
                </div>
              ` : ''}

              ${missingPills ? `
                <div style="margin-top: 16px;">
                  <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 8px;">Missing Job Keywords</div>
                  <div>${missingPills}</div>
                </div>
              ` : ''}

              <!-- Cover Letter / Why Role -->
              ${coverLetter ? `
                <div style="margin-top: 24px;">
                  <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 6px;">Cover Letter Snippet</div>
                  <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 13px; font-style: italic; color: #334155; line-height: 1.5;">
                    "${coverLetter.slice(0, 300)}${coverLetter.length > 300 ? '...' : ''}"
                  </div>
                </div>
              ` : ''}

              <!-- Contact Info Grid -->
              <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px;">
                <div style="font-weight: 800; color: #334155; margin-bottom: 6px;">Candidate Contact Info:</div>
                <div style="color: #475569;">📧 Email: <a href="mailto:${applicantEmail}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${applicantEmail}</a></div>
                ${profile?.phone ? `<div style="color: #475569; margin-top: 4px;">📞 Phone: ${profile.phone}</div>` : ''}
              </div>

              <!-- CTA Button -->
              <div style="margin-top: 28px;">
                <a href="${recruiterDashboardUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; text-align: center; background: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%); color: #ffffff; text-decoration: none; padding: 16px 20px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);">
                  Review Full Profile & CV on Recruiter Portal →
                </a>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 4px 0; font-weight: 600;">Powered by <strong>Sophi AI Career Portal</strong></p>
              <p style="margin: 0; color: #94a3b8;">Automated candidate matching and instant ATS screening for modern recruiters.</p>
            </div>

          </div>
        </body>
        </html>
      `

      if (recruiterTargetEmail) {
        await notify({
          userId: job.recruiter_id || applicantId,
          type: 'application_update',
          title: `New Candidate: ${applicantName} (${matchScore}% match) for ${job.title}`,
          body: `${applicantName} applied for ${job.title} with a ${matchScore}% ATS match score.`,
          data: { job_id: jobId, application_id: application.id },
          email: {
            to: recruiterTargetEmail,
            subject: `🎯 New Candidate Applied: ${applicantName} (${matchScore}% Match) for ${job.title}`,
            html: recruiterHtmlBody
          }
        })
      }
    }

    return NextResponse.json({ success: true, application, matchScore })
  } catch (err: any) {
    console.error('Job application submission error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
