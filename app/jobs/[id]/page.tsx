'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getClientSupabase } from '@/lib/supabase'
import {
  Building2,
  MapPin,
  CheckCircle2,
  Calendar,
  Share2,
  Bookmark,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Loader2,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SingleJobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const supabase = getClientSupabase()

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userCVKeywords, setUserCVKeywords] = useState<string[]>([])
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([])
  const [missingKeywords, setMissingKeywords] = useState<string[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [similarJobs, setSimilarJobs] = useState<any[]>([])

  const CV_BUILDER_URL = process.env.NEXT_PUBLIC_CV_BUILDER_URL || 'https://joinsophi.com'

  useEffect(() => {
    async function loadJobAndUser() {
      if (!jobId) return

      // Increment views count silently
      supabase.rpc('increment_job_views', { job_id_param: jobId }).catch(() => {})

      // Fetch job details
      const { data: jobData, error } = await supabase
        .from('jobs')
        .select('*, recruiter_profiles(*)')
        .eq('id', jobId)
        .single()

      if (error || !jobData) {
        toast.error('Job listing not found')
        router.push('/jobs')
        return
      }

      setJob(jobData)
      setLoading(false)

      // Fetch similar jobs by industry
      if (jobData.industry) {
        const { data: similar } = await supabase
          .from('jobs')
          .select('id, title, company_name, location_city, salary_min, salary_max, salary_visible')
          .eq('industry', jobData.industry)
          .neq('id', jobId)
          .limit(3)
        if (similar) setSimilarJobs(similar)
      }

      // Check current user session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)

        // Check if job is saved
        const { data: saved } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('job_id', jobId)
          .single()
        if (saved) setIsSaved(true)

        // Fetch user's latest Sophi CV transformation
        const { data: latestCv } = await supabase
          .from('cv_jobs')
          .select('gap_analysis, linkedin_optimizer')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (latestCv) {
          const cvKws = [
            ...(latestCv.gap_analysis?.missingKeywords || []),
            ...(latestCv.linkedin_optimizer?.skills || [])
          ].map((k: string) => k.toLowerCase())

          setUserCVKeywords(cvKws)

          // Calculate match score
          const jobKws = (jobData.keywords || []).map((k: string) => k.toLowerCase())
          const matched = cvKws.filter((ck: string) =>
            jobKws.some((jk: string) => jk.includes(ck) || ck.includes(jk))
          )
          const missing = jobKws.filter((jk: string) =>
            !cvKws.some((ck: string) => jk.includes(ck) || ck.includes(jk))
          )

          const score = Math.min(100, Math.round((matched.length / Math.max(jobKws.length, 1)) * 100))
          setMatchScore(score)
          setMatchedKeywords(Array.from(new Set(matched)))
          setMissingKeywords(Array.from(new Set(missing)))
        }
      }
    }

    loadJobAndUser()
  }, [jobId, supabase, router])

  const toggleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save jobs')
      router.push('/auth/login')
      return
    }

    if (isSaved) {
      await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', jobId)
      setIsSaved(false)
      toast.success('Removed from bookmarks')
    } else {
      await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: jobId })
      setIsSaved(true)
      toast.success('Job saved!')
    }
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this job on Sophi Careers: ${job.title} at ${job.company_name} ${url}`)}`, '_blank')
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading job details...</p>
      </div>
    )
  }

  if (!job) return null

  // Schema markup
  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.published_at,
    "validThrough": job.expires_at,
    "employmentType": (job.employment_type || 'full-time').toUpperCase(),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company_name,
      "sameAs": job.website
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location_city || 'Karachi',
        "addressCountry": job.location_country || 'Pakistan'
      }
    },
    ...(job.salary_visible && job.salary_min ? {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "PKR",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.salary_min,
          "maxValue": job.salary_max,
          "unitText": "MONTH"
        }
      }
    } : {})
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />

      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Job Listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column — Job Content (65% ~ 8/12 cols) */}
        <main className="lg:col-span-8 space-y-8">
          {/* Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 font-black text-xl text-slate-700 overflow-hidden">
                  {job.company_logo_url ? (
                    <img src={job.company_logo_url} alt={job.company_name} className="h-full w-full object-cover" />
                  ) : (
                    job.company_name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold mt-1">
                    <span>{job.company_name}</span>
                    {job.is_verified && (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 border-t border-b border-slate-100 py-3">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-slate-400" />
                {job.location_city || 'Pakistan'} ({job.location_type || 'Onsite'})
              </span>
              <span className="flex items-center gap-1 capitalize">
                <Building2 className="h-4 w-4 text-slate-400" />
                {job.employment_type || 'Full-time'}
              </span>
              {job.salary_visible && job.salary_min && (
                <span className="flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <DollarSign className="h-3.5 w-3.5" />
                  PKR {(job.salary_min / 1000).toFixed(0)}k – {(job.salary_max / 1000).toFixed(0)}k / mo
                </span>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Job Description</h2>
            <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Key Responsibilities</h2>
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {job.responsibilities}
              </div>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Requirements & Qualifications</h2>
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {job.requirements}
              </div>
            </div>
          )}

          {/* Company About */}
          {job.recruiter_profiles?.description && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-slate-900">About {job.company_name}</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {job.recruiter_profiles.description}
              </p>
            </div>
          )}
        </main>

        {/* Right Sidebar — Sticky Application & Match Card (35% ~ 4/12 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Match Score Card */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-6 shadow-md space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Your Sophi Match Score
              </h3>

              {!user ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-slate-600 font-medium">Sign in with your Sophi account to see your personalized ATS match score for this role.</p>
                  <Link
                    href="/auth/login"
                    className="w-full block py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                  >
                    Sign In to Check Match
                  </Link>
                </div>
              ) : matchScore !== null ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-blue-600">{matchScore}%</span>
                    <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      {matchScore >= 70 ? 'Strong Match' : matchScore >= 40 ? 'Moderate Match' : 'Low Match'}
                    </span>
                  </div>

                  {matchedKeywords.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase">✓ Matching Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {matchedKeywords.slice(0, 5).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-semibold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {missingKeywords.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-amber-700 uppercase">! Recommended to Add</span>
                      <div className="flex flex-wrap gap-1">
                        {missingKeywords.slice(0, 4).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[11px] font-semibold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 space-y-2">
                  <p className="text-xs text-slate-600">Get your CV optimized with Sophi AI first to unlock instant matching.</p>
                  <a
                    href={CV_BUILDER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs font-bold text-blue-600 hover:underline"
                  >
                    Optimize Your CV Now →
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <Link
                  href={`/apply/${job.id}`}
                  className="w-full block text-center py-3 rounded-xl bg-blue-600 text-white font-extrabold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                >
                  Apply for this Role
                </Link>

                <div className="flex gap-2">
                  <button
                    onClick={toggleSave}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSaved ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
                    <span>{isSaved ? 'Saved' : 'Save Job'}</span>
                  </button>

                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all"
                    title="Share on WhatsApp"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Similar Opportunities</h4>
                <div className="space-y-3">
                  {similarJobs.map(sj => (
                    <Link
                      key={sj.id}
                      href={`/jobs/${sj.id}`}
                      className="block p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                    >
                      <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 line-clamp-1">{sj.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{sj.company_name} · {sj.location_city}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
