import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function notify(params: {
  userId: string
  type: 'job_match' | 'application_update' | 'new_job_alert' | 'cv_ready'
  title: string
  body: string
  data?: Record<string, any>
  email?: { to: string; subject: string; html: string }
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Save to notifications table (in-app)
    await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data ?? {}
    })

    // 2. Send email if provided and Resend API key is configured
    if (params.email && resend) {
      await resend.emails.send({
        from: 'Sophi <noreply@joinsophi.com>',
        to: params.email.to,
        subject: params.email.subject,
        html: params.email.html
      }).catch(err => console.error('Resend email error:', err))
    }

    // 3. Send Expo push notification if user has mobile token
    const { data: profile } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .eq('id', params.userId)
      .single()

    if (profile?.expo_push_token) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: profile.expo_push_token,
          title: params.title,
          body: params.body,
          data: params.data
        })
      }).catch(err => console.error('Expo push error:', err))
    }
  } catch (err) {
    console.error('Failed to dispatch notification:', err)
  }
}
