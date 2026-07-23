'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getClientSupabase } from '@/lib/supabase'
import { Building2, PlusCircle, Eye, Users, Briefcase, CreditCard, Loader2, X, ExternalLink, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RecruiterDashboard() {
  const router = useRouter()
  const supabase = getClientSupabase()

  const [loading, setLoading] = useState(true)
  const [recruiter, setRecruiter] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applicants, setApplicants] = useState<any[]>([])
  const [loadingApplicants, setLoadingApplicants] = useState(false)

  const CV_BUILDER_URL = process.env.NEXT_PUBLIC_CV_BUILDER_URL || 'https://joinsophi.com'

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please sign in to access Recruiter Dashboard')
        router.push('/auth/login?redirect=/recruiter/dashboard')
        return
      }

      const { data: recProfile } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!recProfile) {
        toast.error('No recruiter profile found for this account')
        router.push('/recruiter')
        return
      }

      setRecruiter(recProfile)

      // Fetch recruiter's posted jobs
      const { data: jobList } = await supabase
        .from('jobs')
        .select('*')
        .eq('recruiter_id', session.user.id)
        .order('created_at', { ascending: false })

      if (jobList) setJobs(jobList)
      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  const openApplicantsPanel = async (job: any) => {
    setSelectedJob(job)
    setLoadingApplicants(true)

    const { data: apps } = await supabase
      .from('job_applications')
      .select('*, profiles(*)')
      .eq('job_id', job.id)
      .order('match_score', { ascending: false })

    if (apps) setApplicants(apps)
    setLoadingApplicants(false)
  }

  const handleUpdateStatus = async (applicationId: string, newStatus: string, applicantId: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', applicationId)

      if (error) throw error

      setApplicants(prev =>
        prev.map(a => (a.id === applicationId ? { ...a, status: newStatus } : a))
      )
      toast.success(`Applicant status updated to ${newStatus}`)

      // Send notification via API
      fetch('/api/notify-applicant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: applicantId,
          jobTitle: selectedJob?.title,
          status: newStatus
        })
      }).catch(() => {})
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading recruiter workspace...</p>
      </div>
    )
  }

  const totalViews = jobs.reduce((sum, j) => sum + (j.views_count || 0), 0)
  const totalApps = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{recruiter?.company_name} — Employer Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Recruiter: <strong className="text-slate-700">{recruiter?.full_name || recruiter?.email}</strong>
          </p>
        </div>

        <Link
          href="/recruiter/post-job"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-slate-400">Active Jobs</div>
          <div className="text-2xl font-black text-slate-900">{jobs.filter(j => j.status === 'active').length}</div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-slate-400">Total Applicants</div>
          <div className="text-2xl font-black text-blue-600">{totalApps}</div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-slate-400">Job Views</div>
          <div className="text-2xl font-black text-slate-900">{totalViews}</div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-slate-400">Credits Left</div>
          <div className="text-2xl font-black text-emerald-600">{recruiter?.job_post_credits || 0}</div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your Posted Jobs</h2>
        </div>

        {jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4">Posted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/jobs/${j.id}`} className="font-bold text-slate-900 hover:text-blue-600 text-sm">
                        {j.title}
                      </Link>
                      <div className="text-[11px] text-slate-500">{j.location_city} · {j.location_type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        j.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">{j.views_count || 0}</td>
                    <td className="px-6 py-4 font-extrabold text-blue-600">{j.applications_count || 0}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(j.published_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openApplicantsPanel(j)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                      >
                        View Applicants
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <Briefcase className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">You haven&apos;t posted any job listings yet.</p>
            <Link href="/recruiter/post-job" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 inline-block">
              Post Your First Job →
            </Link>
          </div>
        )}
      </div>

      {/* Applicants Slide-in Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600">Applicants for</span>
                  <h3 className="text-xl font-black text-slate-900">{selectedJob.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {loadingApplicants ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : applicants.length > 0 ? (
                <div className="space-y-4">
                  {applicants.map((app) => (
                    <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {app.profiles?.full_name || app.profiles?.email || 'Candidate'}
                          </div>
                          <div className="text-xs text-slate-500">
                            Applied: {new Date(app.applied_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xl font-black text-blue-600">{app.match_score || 75}%</span>
                          <div className="text-[9px] uppercase font-bold text-slate-400">Match Score</div>
                        </div>
                      </div>

                      {app.cover_letter && (
                        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 line-clamp-3 italic">
                          &quot;{app.cover_letter}&quot;
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <label className="font-bold text-slate-600 flex items-center gap-2">
                          Status:
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value, app.applicant_id)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none"
                          >
                            <option value="applied">Applied</option>
                            <option value="viewed">Viewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview">Interview</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </label>

                        {app.cv_job_id && (
                          <a
                            href={`${CV_BUILDER_URL}/result/${app.cv_job_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View Candidate CV <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                  No applicants received yet for this role.
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedJob(null)}
              className="w-full py-3 rounded-xl bg-slate-100 font-bold text-xs text-slate-700 hover:bg-slate-200"
            >
              Close Panel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
