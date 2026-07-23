'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase'
import { User as UserIcon, LogOut, PlusCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from './Logo'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getClientSupabase()
  const [user, setUser] = useState<any>(null)
  const [isRecruiter, setIsRecruiter] = useState(false)

  const CV_BUILDER_URL = process.env.NEXT_PUBLIC_CV_BUILDER_URL || 'https://joinsophi.com'

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)

      if (session?.user) {
        const { data: recruiter } = await supabase
          .from('recruiter_profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()
        
        setIsRecruiter(!!recruiter)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        const { data: recruiter } = await supabase
          .from('recruiter_profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()
        setIsRecruiter(!!recruiter)
      } else {
        setIsRecruiter(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Logout failed')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center relative h-16 w-[96px]">
          <Link
            href="/"
            className="absolute -top-1 left-0 z-20 hover:scale-105 transition-all bg-white rounded-full p-1.5 shadow-lg border border-slate-100/50 flex items-center justify-center"
          >
            <Logo width={88} height={88} showTagline={true} />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-700">
          <Link href="/jobs" className={`hover:text-primary transition-colors ${pathname === '/jobs' ? 'text-primary font-extrabold' : ''}`}>
            Browse Jobs
          </Link>
          <Link href="/companies" className={`hover:text-primary transition-colors ${pathname === '/companies' ? 'text-primary font-extrabold' : ''}`}>
            Companies
          </Link>
          <a
            href={CV_BUILDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-700 hover:text-gold transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            Build/Optimize CV
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/recruiter"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-primary px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
          >
            For Recruiters
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={isRecruiter ? '/recruiter/dashboard' : '/dashboard'}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-primary-950 hover:bg-slate-200 transition-all"
              >
                <UserIcon className="h-3.5 w-3.5 text-gold-600" />
                <span>{isRecruiter ? 'Recruiter Dashboard' : 'My Dashboard'}</span>
              </Link>

              {isRecruiter && (
                <Link
                  href="/recruiter/post-job"
                  className="flex items-center gap-1.5 rounded-xl bg-primary-950 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-900 transition-all"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-gold-400" />
                  <span>Post a Job</span>
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/recruiter/post-job"
                className="rounded-xl bg-primary-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-900 transition-all"
              >
                Post Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
