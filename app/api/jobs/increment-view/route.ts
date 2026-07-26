import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json()

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch current views_count
    const { data: job } = await supabase
      .from('jobs')
      .select('views_count')
      .eq('id', jobId)
      .single()

    const currentViews = job?.views_count || 0
    const newViews = currentViews + 1

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ views_count: newViews })
      .eq('id', jobId)

    if (updateError) {
      console.error('Failed to increment views count:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, views_count: newViews })
  } catch (err: any) {
    console.error('Increment job view API error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
