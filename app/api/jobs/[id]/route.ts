import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, job })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch job' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const body = await req.json()

    const {
      title,
      companyName,
      companyLogoUrl,
      department,
      industry,
      locationCity,
      locationType,
      employmentType,
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
      status,
    } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const updatePayload: Record<string, any> = {}
    if (title !== undefined) updatePayload.title = title
    if (companyName !== undefined) updatePayload.company_name = companyName
    if (companyLogoUrl !== undefined) updatePayload.company_logo_url = companyLogoUrl
    if (department !== undefined) updatePayload.department = department
    if (industry !== undefined) updatePayload.industry = industry
    if (locationCity !== undefined) updatePayload.location_city = locationCity
    if (locationType !== undefined) updatePayload.location_type = locationType
    if (employmentType !== undefined) updatePayload.employment_type = employmentType
    if (experienceLevel !== undefined) updatePayload.experience_level = experienceLevel
    if (experienceYearsMin !== undefined) updatePayload.experience_years_min = Number(experienceYearsMin)
    if (experienceYearsMax !== undefined) updatePayload.experience_years_max = Number(experienceYearsMax)
    if (salaryMin !== undefined) updatePayload.salary_min = Number(salaryMin)
    if (salaryMax !== undefined) updatePayload.salary_max = Number(salaryMax)
    if (salaryVisible !== undefined) updatePayload.salary_visible = salaryVisible
    if (description !== undefined) updatePayload.description = description
    if (requirements !== undefined) updatePayload.requirements = requirements
    if (responsibilities !== undefined) updatePayload.responsibilities = responsibilities
    if (benefits !== undefined) updatePayload.benefits = benefits
    if (status !== undefined) updatePayload.status = status

    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update(updatePayload)
      .eq('id', jobId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, job: updatedJob })
  } catch (err: any) {
    console.error('Update job error:', err)
    return NextResponse.json({ error: err.message || 'Failed to update job' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete job' }, { status: 500 })
  }
}
