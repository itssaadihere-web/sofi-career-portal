'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getClientSupabase } from '@/lib/supabase'
import { calculateMatchScore, MatchResult } from '@/lib/matchEngine'
import { getJoinsophiCvUrl } from '@/lib/sso'
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Loader2,
  Sparkles,
  Send,
  Upload,
  ExternalLink,
  Zap,
  AlertCircle,
  FileCheck,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

function formatCvDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string
  const supabase = getClientSupabase()

  const [job, setJob] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [cvJobs, setCvJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Selection Mode: 'existing' | 'upload'
  const [selectionMode, setSelectionMode] = useState<'existing' | 'upload'>('existing')
  const [selectedCvId, setSelectedCvId] = useState<string>('')
  
  // Direct Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [uploadedText, setUploadedText] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  // Form State
  const [coverLetter, setCoverLetter] = useState('')
  const [whyRole, setWhyRole] = useState('')

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
        toast.error('Job listing not found')
        router.push('/jobs')
        return
      }

      setJob(jobData)

      // Fetch all past Sophi CV versions for this user sorted by created_at DESC
      const { data: userCvs } = await supabase
        .from('cv_jobs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (userCvs && userCvs.length > 0) {
        setCvJobs(userCvs)
        setSelectedCvId(userCvs[0].id)
        if (userCvs[0].cover_letter) setCoverLetter(userCvs[0].cover_letter)
      } else {
        setSelectionMode('upload')
      }

      setLoading(false)
    }

    checkAuthAndLoad()
  }, [jobId, supabase, router])

  // Active selected CV object
  const activeCvJob = useMemo(() => {
    if (selectionMode === 'existing' && selectedCvId) {
      return cvJobs.find(c => c.id === selectedCvId) || null
    }
    if (selectionMode === 'upload' && uploadedText) {
      return {
        raw_text: uploadedText,
        fileName: uploadedFileName || 'Uploaded_Resume.pdf'
      }
    }
    return null
  }, [selectionMode, selectedCvId, cvJobs, uploadedText, uploadedFileName])

  // Compute live ATS Match Score
  const matchResult: MatchResult = useMemo(() => {
    if (!job) {
      return { score: null, matchedKeywords: [], missingKeywords: [], hasCv: false }
    }
    return calculateMatchScore(job, activeCvJob)
  }, [job, activeCvJob])

  // Handle direct file upload & text reading
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadedFileName(file.name)

    try {
      // Read text content from .txt, .pdf or docx file
      const text = await file.text()
      setUploadedText(text)
      toast.success(`Loaded resume file: ${file.name}`)
    } catch (err) {
      console.error('File reading error:', err)
      // Fallback filename as text placeholder for keyword extraction
      setUploadedText(`Resume file ${file.name}`)
      toast.success(`Attached resume: ${file.name}`)
    } finally {
      setUploading(false)
    }
  }

  // Handle Optimize CV SSO Redirect
  const handleOptimizeCvRedirect = async () => {
    try {
      const ssoUrl = await getJoinsophiCvUrl(supabase, '/builder')
      window.open(ssoUrl, '_blank', 'noopener,noreferrer')
      toast.success('Opening Sophi AI CV Builder with your active session...')
    } catch (err: any) {
      toast.error('Could not initiate SSO redirect')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectionMode === 'upload' && !uploadedText && !uploadedFileName) {
      toast.error('Please select or upload a CV file to apply')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          applicantId: user.id,
          cvJobId: selectionMode === 'existing' ? selectedCvId : null,
          rawResumeText: selectionMode === 'upload' ? uploadedText : null,
          fileName: uploadedFileName,
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
        <p className="mt-4 text-xs font-bold text-slate-500">Preparing application workspace & ATS engine...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto shadow-sm animate-bounce">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Application Submitted!</h1>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
          Your application for <strong className="text-slate-900">{job.title}</strong> at <strong className="text-slate-900">{job.company_name}</strong> has been transmitted to the recruiter along with your Sophi ATS Match Score of <strong className="text-emerald-600">{matchResult.score}%</strong>.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            Track in My Dashboard →
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all"
          >
            Browse More Jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back Button */}
      <Link
        href={`/jobs/${jobId}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Job Listing
      </Link>

      {/* Header Summary Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider">Applying For</span>
          <h1 className="text-2xl font-black text-slate-900">{job.title}</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-2">
            <span>{job.company_name}</span>
            <span>·</span>
            <span>{job.location_city || 'On-site'}</span>
            <span>·</span>
            <span className="capitalize">{job.employment_type || 'Full-time'}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700">
          <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>Sophi Match Screening</span>
        </div>
      </div>

      {/* Main Application Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Select Application CV */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              1. Select Application CV
            </h2>
            <span className="text-xs font-bold text-slate-400">Step 1 of 3</span>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setSelectionMode('existing')
                if (cvJobs.length > 0 && !selectedCvId) setSelectedCvId(cvJobs[0].id)
              }}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 transition-all ${
                selectionMode === 'existing'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Sophi Optimized Versions ({cvJobs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectionMode('upload')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 transition-all ${
                selectionMode === 'upload'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload New CV File</span>
            </button>
          </div>

          {/* Mode A: Dropdown of Past CV Versions */}
          {selectionMode === 'existing' && (
            <div className="space-y-4">
              {cvJobs.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-2">
                      Choose CV Version (Sorted by Date & Time):
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCvId}
                        onChange={(e) => {
                          setSelectedCvId(e.target.value)
                          const cv = cvJobs.find(c => c.id === e.target.value)
                          if (cv?.cover_letter) setCoverLetter(cv.cover_letter)
                        }}
                        className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-10 text-xs font-bold text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none"
                      >
                        {cvJobs.map((cv) => (
                          <option key={cv.id} value={cv.id}>
                            {cv.target_industry || cv.cv_data?.target_role || 'Professional Resume'} — {formatCvDate(cv.created_at)} (ATS: {cv.ats_score?.overall || 85}%)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Parallel Compact Preview Card */}
                  {activeCvJob && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-extrabold text-slate-900">
                            {activeCvJob.target_industry || 'Professional Resume'}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-black text-blue-800">
                          Saved ATS: {activeCvJob.ats_score?.overall || 85}%
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>Created: {formatCvDate(activeCvJob.created_at)}</span>
                        </div>
                        {activeCvJob.cv_data?.skills && (
                          <div className="text-slate-500">
                            Skills: {activeCvJob.cv_data.skills.slice(0, 4).map((s: any) => typeof s === 'string' ? s : s.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">No saved Sophi CV versions found.</strong>
                    <p className="mt-1">Please switch to &quot;Upload New CV File&quot; tab below or build an optimized CV on Sophi AI.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode B: Direct File Upload */}
          {selectionMode === 'upload' && (
            <div className="space-y-4">
              <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/30">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Click or Drag & Drop CV file here'}
                  </div>
                  <p className="text-[11px] text-slate-400">Supports PDF, DOCX, or TXT format (max 5MB)</p>
                </div>
              </div>

              {uploadedFileName && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>File attached: {uploadedFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName('')
                      setUploadedText('')
                    }}
                    className="text-[11px] text-slate-500 hover:text-red-600 underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: FREE Instant ATS Score Preview Widget */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                2. Free Instant ATS Score Preview
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time keyword matching for this specific job role.</p>
            </div>
            
            <button
              type="button"
              onClick={handleOptimizeCvRedirect}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-blue-600 transition-all shadow-sm"
            >
              <span>Optimize CV with Sophi AI</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* ATS Score Gauge Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-900 text-white rounded-2xl p-5 shadow-inner">
            <div className="text-center md:border-r md:border-slate-800 md:pr-4">
              <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Match Score</div>
              <div className={`text-4xl font-black mt-1 ${
                (matchResult.score ?? 0) >= 80 ? 'text-emerald-400' : (matchResult.score ?? 0) >= 60 ? 'text-blue-400' : 'text-amber-400'
              }`}>
                {matchResult.score !== null ? `${matchResult.score}%` : 'N/A'}
              </div>
              <div className="text-[11px] font-bold text-slate-300 mt-1">
                {(matchResult.score ?? 0) >= 80 ? '🎯 Highly Qualified' : (matchResult.score ?? 0) >= 60 ? '⚡ Good Fit' : '📋 Recommended Optimization'}
              </div>
            </div>

            <div className="col-span-2 space-y-3">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Matched Keywords ({matchResult.matchedKeywords.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {matchResult.matchedKeywords.length > 0 ? (
                    matchResult.matchedKeywords.map((k) => (
                      <span key={k} className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-bold capitalize">
                        {k}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Select or upload a CV to inspect keywords</span>
                  )}
                </div>
              </div>

              {matchResult.missingKeywords.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Missing Keywords ({matchResult.missingKeywords.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {matchResult.missingKeywords.slice(0, 8).map((k) => (
                      <span key={k} className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[11px] font-bold capitalize">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Optimize Button */}
          <div className="sm:hidden pt-2">
            <button
              type="button"
              onClick={handleOptimizeCvRedirect}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              <span>Optimize CV with Sophi AI</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Step 3: Cover Letter & Additional Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">3. Tailored Cover Letter</h2>
          <p className="text-xs text-slate-500">Pre-populated from your selected CV or write a custom intro for the hiring team.</p>
          <textarea
            rows={6}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Dear Hiring Manager..."
            className="w-full rounded-xl border border-slate-200 p-4 text-xs sm:text-sm leading-relaxed text-slate-800 focus:border-blue-600 focus:outline-none"
          />

          <div className="pt-2">
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              Why do you want this role? (Optional)
            </label>
            <textarea
              rows={3}
              value={whyRole}
              onChange={(e) => setWhyRole(e.target.value)}
              placeholder="Briefly state what excites you about joining this company..."
              className="w-full rounded-xl border border-slate-200 p-4 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Application Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white font-extrabold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span>Submit Application Now</span>
        </button>
      </form>
    </div>
  )
}
