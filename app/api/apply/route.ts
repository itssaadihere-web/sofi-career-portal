import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notify } from '@/lib/notificationEngine'

export async function POST(req: NextRequest) {
  try {
    const { jobId, applicantId, cvJobId, coverLetter, whyRole } = await req.json()

    if (!jobId || !applicantId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch job and applicant details
    const { data: job } = await supabase
      .from('jobs')
      .select('*, recruiter_profiles(*)')
      .eq('id', jobId)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', applicantId)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 })
    }

    // Calculate keyword match score
    let matchScore = 75
    if (cvJobId) {
      const { data: cvJob } = await supabase
        .from('cv_jobs')
        .select('gap_analysis, linkedin_optimizer')
        .eq('id', cvJobId)
        .single()

      if (cvJob) {
        const cvKws = [
          ...(cvJob.gap_analysis?.missingKeywords || []),
          ...(cvJob.linkedin_optimizer?.skills || [])
        ].map((k: string) => k.toLowerCase())

        const jobKws = (job.keywords || []).map((k: string) => k.toLowerCase())
        const matched = cvKws.filter((ck: string) =>
          jobKws.some((jk: string) => jk.includes(ck) || ck.includes(jk))
        )
        matchScore = Math.min(100, Math.round((matched.length / Math.max(jobKws.length, 1)) * 100))
      }
    }

    // 2. Insert into job_applications table
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

    // 3. Increment applications_count on the job
    await supabase
      .from('jobs')
      .update({ applications_count: (job.applications_count || 0) + 1 })
      .eq('id', jobId)

    // 4. Notify applicant via email + in-app + push
    const applicantName = profile?.full_name || profile?.email || 'Applicant'
    await notify({
      userId: applicantId,
      type: 'application_update',
      title: 'Application Submitted!',
      body: `Your application to ${job.company_name} for ${job.title} has been received.`,
      data: { job_id: jobId, application_id: application.id },
      email: profile?.email ? {
        to: profile.email,
        subject: `Application Confirmed: ${job.title} at ${job.company_name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Application Confirmed!</h2>
            <p>Hi ${applicantName},</p>
            <p>Your application for <strong>${job.title}</strong> at <strong>${job.company_name}</strong> has been successfully submitted.</p>
            <p>Your Sophi Match Score: <strong>${matchScore}%</strong></p>
            <p>You can track your application status anytime in your Sophi Careers dashboard.</p>
          </div>
        `
      } : undefined
    })

    // 5. Notify recruiter via email + in-app
    if (job.recruiter_id) {
      await notify({
        userId: job.recruiter_id,
        type: 'application_update',
        title: `New Application for ${job.title}`,
        body: `${applicantName} applied for ${job.title} — ${matchScore}% match score.`,
        data: { job_id: jobId, application_id: application.id },
        email: job.application_email || job.recruiter_profiles?.email ? {
          to: job.application_email || job.recruiter_profiles.email,
          subject: `New Candidate: ${applicantName} (${matchScore}% match) for ${job.title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>New Candidate Received</h2>
              <p><strong>Candidate:</strong> ${applicantName}</p>
              <p><strong>Role:</strong> ${job.title}</p>
              <p><strong>Sophi Match Score:</strong> ${matchScore}%</p>
              <p>Log in to your Recruiter Dashboard on Sophi Careers to review the full profile and CV.</p>
            </div>
          `
        } : undefined
      })
    }

    return NextResponse.json({ success: true, application })
  } catch (err: any) {
    console.error('Job application submission error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
