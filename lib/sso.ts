import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Builds a Single Sign-On (SSO) handoff URL to joinsophi.com
 * Transfers the active Supabase session (access_token & refresh_token)
 * so job seekers remain seamlessly logged in with their exact user ID across both sites.
 */
export async function getJoinsophiCvUrl(
  supabase: SupabaseClient,
  targetPath: string = '/'
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_CV_BUILDER_URL || 'https://joinsophi.com'
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.access_token && session?.refresh_token) {
    const params = new URLSearchParams({
      sso_token: session.access_token,
      sso_refresh: session.refresh_token,
      user_id: session.user.id,
      email: session.user.email || '',
      redirect: targetPath,
    }).toString()

    // Pass as both URL params and hash fragment for maximum compatibility across versions
    return `${baseUrl}/auth/sso?${params}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=recovery`
  }

  return baseUrl
}
