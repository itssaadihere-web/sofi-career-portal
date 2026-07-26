import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(req: NextRequest) {
  try {
    const {
      recruiterId,
      fullName,
      companyName,
      companyLogoUrl,
      industry,
      companySize,
      locationCity,
    } = await req.json()

    if (!recruiterId) {
      return NextResponse.json({ error: 'recruiterId is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const updatePayload: Record<string, any> = {}
    if (fullName !== undefined) updatePayload.full_name = fullName
    if (companyName !== undefined) updatePayload.company_name = companyName
    if (companyLogoUrl !== undefined) updatePayload.company_logo_url = companyLogoUrl
    if (industry !== undefined) updatePayload.industry = industry
    if (companySize !== undefined) updatePayload.company_size = companySize
    if (locationCity !== undefined) updatePayload.location_city = locationCity

    const { data: updatedProfile, error } = await supabase
      .from('recruiter_profiles')
      .update(updatePayload)
      .eq('id', recruiterId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (err: any) {
    console.error('Update recruiter profile error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to update recruiter profile' },
      { status: 500 }
    )
  }
}
