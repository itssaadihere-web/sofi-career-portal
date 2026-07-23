'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SSOPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = getClientSupabase()

  useEffect(() => {
    async function handleSSO() {
      const token = searchParams.get('sso_token')
      const refresh = searchParams.get('sso_refresh')

      if (token && refresh) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: refresh
          })

          if (error) throw error

          toast.success('Successfully authenticated via Single Sign-On!')
          router.push('/dashboard')
          return
        } catch (err: any) {
          console.error('SSO handoff error:', err)
          toast.error('SSO authentication failed. Please sign in.')
        }
      }

      router.push('/auth/login')
    }

    handleSSO()
  }, [searchParams, supabase, router])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="mt-4 text-xs font-semibold text-slate-500">Signing you in securely via Sophi SSO...</p>
    </div>
  )
}
