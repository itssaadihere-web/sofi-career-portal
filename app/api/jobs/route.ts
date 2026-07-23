import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      recruiterId,
      title,
      companyName,
      locationCity,
      locationType,
      employmentType,
      industry,
      department,
      experienceLevel,
      experienceYearsMin,
      experienceYearsMax,
      salaryMin,
      salaryMax,
      salaryVisible,
      description,
      requirements,
      responsibilities,
      benefits,
      applicationEmail,
      applicationUrl,
      applyViaSophi,
    } = body

    if (!recruiterId || !title || !companyName || !description) {
      return NextResponse.json({ error: 'Missing required job fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check recruiter credits
    const { data: recruiter } = await supabase
      .from('recruiter_profiles')
      .select('job_post_credits')
      .eq('id', recruiterId)
      .single()

    if (!recruiter || (recruiter.job_post_credits ?? 0) <= 0) {
      return NextResponse.json({ error: 'Insufficient job post credits. Please upgrade your plan.' }, { status: 403 })
    }

    // Auto-extract top 15 ATS keywords using Kimi AI API
    let keywords: string[] = []
    try {
      const kimiKey = process.env.KIMI_API_KEY
      const kimiBase = process.env.KIMI_API_BASE || 'https://api.moonshot.ai/v1'

      if (kimiKey) {
        const res = await fetch(`${kimiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${kimiKey}`
          },
          body: JSON.stringify({
            model: 'moonshot-v1-8k',
            messages: [
              {
                role: 'system',
                content: 'You are an expert ATS parser. Extract the top 15 essential technical & professional ATS keywords from the job description. Return ONLY a valid JSON array of string keywords.'
              },
              {
                role: 'user',
                content: `Extract ATS keywords from this JD:\nTitle: ${title}\nDescription: ${description}`
              }
            ],
            temperature: 0.1
          })
        })

        if (res.ok) {
          const data = await res.json()
          const content = data.choices?.[0]?.message?.content || ''
          const match = content.match(/\[.*\]/s)
          if (match) {
            keywords = JSON.parse(match[0])
          }
        }
      }
    } catch (err) {
      console.error('Kimi keyword extraction error:', err)
      // Fallback keyword parsing from title & description
      keywords = Array.from(new Set(
        `${title} ${description}`
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .split(/\s+/)
          .filter(w => w.length > 3)
      )).slice(0, 15)
    }

    // Insert job into database
    const { data: newJob, error: insertError } = await supabase
      .from('jobs')
      .insert({
        recruiter_id: recruiterId,
        title,
        company_name: companyName,
        location_city: locationCity || 'Karachi',
        location_type: locationType || 'onsite',
        employment_type: employmentType || 'full-time',
        industry: industry || 'Technology',
        department,
        experience_level: experienceLevel || 'mid',
        experience_years_min: experienceYearsMin || 0,
        experience_years_max: experienceYearsMax || null,
        salary_min: salaryMin || null,
        salary_max: salaryMax || null,
        salary_visible: salaryVisible ?? true,
        description,
        requirements,
        responsibilities,
        benefits,
        keywords,
        application_email: applicationEmail || null,
        application_url: applicationUrl || null,
        apply_via_sophi: applyViaSophi ?? true,
        status: 'active',
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Decrement recruiter job_post_credits by 1
    await supabase
      .from('recruiter_profiles')
      .update({ job_post_credits: Math.max(0, (recruiter.job_post_credits || 1) - 1) })
      .eq('id', recruiterId)

    return NextResponse.json({ success: true, job: newJob })
  } catch (err: any) {
    console.error('Post job API error:', err)
    return NextResponse.json({ error: err.message || 'Failed to post job' }, { status: 500 })
  }
}
