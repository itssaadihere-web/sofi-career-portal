import { NextResponse } from 'next/server'
import { sendSystemErrorReport } from '@/lib/errorReporter'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userAgent = req.headers.get('user-agent') || undefined

    await sendSystemErrorReport({
      errorMessage: body.errorMessage || 'Unknown Client Exception',
      errorStack: body.errorStack,
      url: body.url,
      userId: body.userId,
      userEmail: body.userEmail,
      userAgent,
      additionalContext: body.additionalContext
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error handling /api/report-error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
