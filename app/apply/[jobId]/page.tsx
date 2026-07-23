'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getClientSupabase } from '@/lib/supabase'
import { ArrowLeft, FileText, CheckCircle2, Loader2, Sparkles, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string
  const supabase = getClientSupabase()

  const [job, setJob] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [userCvJob, setUserCvJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Form State
  const [coverLetter, setCoverLetter] = useState('')
  const [whyRole, setWhyRole] = useState('')
  const [applyOption, setApplyOption] = useState<'sophi' | 'upload'>('sophi')

  useEffect(() => {
    async function checkAuthAndLoad() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please sign in to submit your job application')
        router.push(`/auth/login?redirect=/apply/${jobId}`)
        return
      }

      setUser(session.user)

      // Fetch job details
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*, recruiter_profiles(*)')
        .eq('id', jobId)
        .single()

      if (!jobData) {
        toast.error('Job not found')
        router.push('/jobs')
        return
      }

      setJob(jobData)

      // Fetch latest Sophi CV transformation
      const { data: cvJob } = await supabase
        .from('cv_jobs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (cvJob) {
        setUserCvJob(cvJob)
        if (cvJob.cover_letter) setCoverLetter(cvJob.cover_letter)
      }

      setLoading(false)
    }

    checkAuthAndLoad()
  }, [jobId, supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          applicantId: user.id,
          cvJobId: userCvJob?.id || null,
          coverLetter,
          whyRole
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to submit application')

      setSubmitted(true)
      toast.success('Application submitted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Error submitting application')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Preparing application workspace...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto shadow-sm">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Application Submitted!</h1>
        <p className="text-sm text-slate-600 font-medium">
          Your application for <strong className="text-slate-800">{job.title}</strong> at <strong className="text-slate-800">{job.company_name}</strong> has been received. The hiring manager will review your Sophi match score.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md"
          >
            Track in My Dashboard →
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
          >
            Browse More Jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Link
        href={`/jobs/${jobId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Job Details
      </Link>

      {/* Header Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider">Applying For</span>
          <h1 className="text-2xl font-black text-slate-900">{job.title}</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {job.company_name} · {job.location_city || 'Pakistan'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CV Selection Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            1. Select Application CV
          </h2>

          {userCvJob ? (
            <div
              onClick={() => setApplyOption('sophi')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                applyOption === 'sophi' ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Sophi AI-Optimized CV</div>
                    <div className="text-xs text-slate-500">
                      Target Industry: {userCvJob.target_industry || 'Professional'} · ATS Score: {userCvJob.ats_score?.overall || 85}%
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="cvOption"
                  checked={applyOption === 'sophi'}
                  onChange={() => setApplyOption('sophi')}
                  className="h-4 w-4 text-blue-600"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              No Sophi CV found on your account yet. We recommend creating one at <a href="https://joinsophi.com" target="_blank" className="font-bold underline">joinsophi.com</a> to get high ATS ranking!
            </div>
          )}
        </div>

        {/* Cover Letter */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Tailored Cover Letter</h2>
          <p className="text-xs text-slate-500">Pre-populated from your Sophi CV transformation or edit as needed.</p>
          <textarea
            rows={8}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Dear Hiring Manager..."
            className="w-full rounded-xl border border-slate-200 p-4 text-xs sm:text-sm leading-relaxed text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Why do you want this role? */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Why do you want this role? (Optional)</h2>
          <textarea
            rows={3}
            value={whyRole}
            onChange={(e) => setWhyRole(e.target.value)}
            placeholder="Briefly explain what excites you about this opportunity..."
            className="w-full rounded-xl border border-slate-200 p-4 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white font-extrabold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span>Submit Application Now</span>
        </button>
      </form>
    </div>
  )
}
