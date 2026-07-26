'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getClientSupabase } from '@/lib/supabase'
import { Building2, PlusCircle, Eye, Users, Briefcase, Loader2, X, ExternalLink, Sparkles, Edit3, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import EditRecruiterProfileModal from '@/components/EditRecruiterProfileModal'
import CompanyLogo from '@/components/CompanyLogo'

export default function RecruiterDashboard() {
  const router = useRouter()
  const supabase = getClientSupabase()

  const [loading, setLoading] = useState(true)
  const [recruiter, setRecruiter] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applicants, setApplicants] = useState<any[]>([])
  const [loadingApplicants, setLoadingApplicants] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  // Metrics
  const [discardedCount, setDiscardedCount] = useState(0)
  const [totalApplicationsCount, setTotalApplicationsCount] = useState(0)

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

      if (jobList) {
        setJobs(jobList)

        // Fetch applications to compute total applications & discarded count
        const jobIds = jobList.map((j) => j.id)
        if (jobIds.length > 0) {
          const { data: allApps } = await supabase
            .from('job_applications')
            .select('id, status')
            .in('job_id', jobIds)

          if (allApps) {
            setTotalApplicationsCount(allApps.length)
            setDiscardedCount(
              allApps.filter((a) => a.status === 'rejected' || a.status === 'discarded').length
            )
          }
        }
      }

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

      setApplicants((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a))
      )

      // Re-calculate discarded count locally
      if (newStatus === 'rejected' || newStatus === 'discarded') {
        setDiscardedCount((prev) => prev + 1)
      }

      toast.success(`Applicant status updated to ${newStatus}`)

      // Send notification via API
      fetch('/api/notify-applicant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: applicantId,
          jobTitle: selectedJob?.title,
          status: newStatus,
        }),
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <CompanyLogo
            companyName={recruiter?.company_name || 'Employer'}
            logoUrl={recruiter?.company_logo_url}
            sizeClassName="h-12 w-12 text-sm"
          />
          <div>
            <h1 className="text-2xl font-black text-slate-900">{recruiter?.company_name} — Employer Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Recruiter: <strong className="text-slate-700">{recruiter?.full_name || recruiter?.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs hover:bg-slate-100 transition-all shrink-0"
          >
            <Edit3 className="h-4 w-4 text-slate-600" />
            <span>Edit Profile</span>
          </button>

          <Link
            href="/recruiter/post-job"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      {/* 4 Requested Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Active Jobs */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-slate-400">Active Jobs</div>
          <div className="text-2xl font-black text-slate-900">{jobs.filter((j) => j.status === 'active').length}</div>
        </div>

        {/* 2. Job Views */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-slate-400">Job Views</div>
          <div className="text-2xl font-black text-slate-900">{totalViews}</div>
        </div>

        {/* 3. Job Applications */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-slate-400">Job Applications</div>
          <div className="text-2xl font-black text-blue-600">{totalApplicationsCount}</div>
        </div>

        {/* 4. Applications Discarded */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-slate-400">Applications Discarded</div>
          <div className="text-2xl font-black text-red-600">{discardedCount}</div>
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
                      <div className="flex items-center gap-3">
                        <CompanyLogo
                          companyName={j.company_name}
                          logoUrl={j.company_logo_url}
                          sizeClassName="h-8 w-8 text-xs"
                        />
                        <div>
                          <Link href={`/jobs/${j.id}`} className="font-bold text-slate-900 hover:text-blue-600 text-sm">
                            {j.title}
                          </Link>
                          <div className="text-[11px] text-slate-500">{j.company_name} · {j.location_city}</div>
                        </div>
                      </div>
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/recruiter/edit-job/${j.id}`}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                        >
                          Edit Job
                        </Link>
                        <button
                          onClick={() => openApplicantsPanel(j)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                        >
                          View Applicants
                        </button>
                      </div>
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
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{selectedJob.title}</h3>
                <p className="text-xs text-slate-500 font-medium">Ranked Applicants by Sophi Kimi AI Match Score</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {loadingApplicants ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs font-semibold">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
                  Fetching applicant CV profiles...
                </div>
              ) : applicants.length > 0 ? (
                applicants.map((app) => (
                  <div key={app.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {app.profiles?.full_name || app.applicant_email}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">{app.applicant_email} · Applied {new Date(app.created_at).toLocaleDateString()}</p>
                      </div>

                      {app.match_score !== undefined && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-black text-xs shadow-2xs">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          <span>{app.match_score}% AI Match</span>
                        </div>
                      )}
                    </div>

                    {app.cover_note && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                        &quot;{app.cover_note}&quot;
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      {/* Status Selector */}
                      <select
                        value={app.status || 'applied'}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value, app.user_id)}
                        className="p-2 rounded-xl border border-slate-200 font-bold text-slate-700 bg-white focus:outline-none"
                      >
                        <option value="applied">Applied</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted ⭐</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="hired">Hired 🎉</option>
                        <option value="rejected">Discarded / Rejected ❌</option>
                      </select>

                      {app.profiles?.id && (
                        <a
                          href={`${CV_BUILDER_URL}/dashboard`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
                        >
                          <span>View Full Sophi CV</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-xs text-slate-500 font-medium">
                  No candidate applications received yet for this role.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Recruiter Profile Modal */}
      {recruiter && (
        <EditRecruiterProfileModal
          recruiter={recruiter}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSuccess={(updated) => setRecruiter(updated)}
        />
      )}
    </div>
  )
}
