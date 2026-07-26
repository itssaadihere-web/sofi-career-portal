import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      password,
      fullName,
      companyName,
      companyLogoUrl,
      companySize,
      industry,
      locationCity
    } = await req.json()

    if (!email || !password || !companyName) {
      return NextResponse.json({ error: 'Missing required signup fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create user in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Insert into recruiter_profiles with unlimited free job post access
    const { error: profileError } = await supabase.from('recruiter_profiles').insert({
      id: authUser.user!.id,
      email,
      full_name: fullName,
      company_name: companyName,
      company_logo_url: companyLogoUrl || null,
      company_size: companySize || '11-50',
      industry: industry || 'Technology',
      location_city: locationCity || 'Karachi',
      job_post_credits: 999999 // 100% Free unlimited job posts
    })

    if (profileError) throw profileError

    return NextResponse.json({ success: true, userId: authUser.user!.id })
  } catch (err: any) {
    console.error('Recruiter signup API error:', err)
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status: 500 })
  }
}
