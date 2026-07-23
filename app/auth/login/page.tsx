'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase'
import { Loader2, Mail, Lock, Sparkles, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const supabase = getClientSupabase()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isRecruiter, setIsRecruiter] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Signed in successfully!')
        router.push(redirect)
      } else {
        if (isRecruiter) {
          const res = await fetch('/api/recruiter/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName, companyName })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Recruiter registration failed')
          toast.success('Recruiter account created! Signing in...')
          await supabase.auth.signInWithPassword({ email, password })
          router.push('/recruiter/dashboard')
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
          })
          if (error) throw error
          toast.success('Account created! Please sign in.')
          setMode('signin')
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-2xl mx-auto shadow-md">
            S
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {mode === 'signin' ? 'Sign In to Sophi Careers' : 'Create Sophi Account'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Single account across CV Builder, Career Portal & Mobile App
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Email Address</label>
            <div className="flex items-center gap-2 px-3 py-2.5 mt-1 rounded-xl border border-slate-200 bg-slate-50">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Password</label>
            <div className="flex items-center gap-2 px-3 py-2.5 mt-1 rounded-xl border border-slate-200 bg-slate-50">
              <Lock className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold focus:outline-none"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecruiter}
                  onChange={(e) => setIsRecruiter(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>I am registering as an Employer / Recruiter</span>
              </label>

              {isRecruiter && (
                <div>
                  <label className="text-xs font-bold uppercase text-slate-600">Company Name</label>
                  <input
                    type="text"
                    required={isRecruiter}
                    placeholder="Acme Technologies"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs sm:text-sm hover:bg-blue-700 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
          {mode === 'signin' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-blue-600 font-bold hover:underline">
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button onClick={() => setMode('signin')} className="text-blue-600 font-bold hover:underline">
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
