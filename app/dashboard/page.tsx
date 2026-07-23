'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getClientSupabase } from '@/lib/supabase'
import JobCard from '@/components/JobCard'
import { Briefcase, Bookmark, Sparkles, User, ExternalLink, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SeekerDashboard() {
  const router = useRouter()
  const supabase = getClientSupabase()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'applications' | 'saved' | 'recommended' | 'profile'>('applications')

  // Data states
  const [applications, setApplications] = useState<any[]>([])
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  const CV_BUILDER_URL = process.env.NEXT_PUBLIC_CV_BUILDER_URL || 'https://joinsophi.com'

  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please sign in to view your dashboard')
        router.push('/auth/login')
        return
      }

      setUser(session.user)

      // Fetch user profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (prof) setProfile(prof)

      // Fetch Applications
      const { data: apps } = await supabase
        .from('job_applications')
        .select('*, jobs(*)')
        .eq('applicant_id', session.user.id)
        .order('applied_at', { ascending: false })
      if (apps) setApplications(apps)

      // Fetch Saved Jobs
      const { data: saved } = await supabase
        .from('saved_jobs')
        .select('*, jobs(*)')
        .eq('user_id', session.user.id)
        .order('saved_at', { ascending: false })
      if (saved) setSavedJobs(saved.map(s => s.jobs).filter(Boolean))

      // Fetch Recommendations
      const { data: recs } = await supabase
        .from('job_recommendations')
        .select('*, jobs(*)')
        .eq('user_id', session.user.id)
        .order('match_score', { ascending: false })
      if (recs) setRecommendedJobs(recs)

      setLoading(false)
    }

    loadUserData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading your candidate dashboard...</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const s = (status || 'applied').toLowerCase()
    const styles: Record<string, string> = {
      applied: 'bg-slate-100 text-slate-700 border-slate-200',
      viewed: 'bg-blue-50 text-blue-700 border-blue-200',
      shortlisted: 'bg-amber-50 text-amber-700 border-amber-200',
      interview: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold',
      hired: 'bg-green-100 text-green-800 border-green-300 font-black',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    }
    return (
      <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase ${styles[s] || styles.applied}`}>
        {s}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Welcome Back, {profile?.full_name || user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage your applications, saved jobs, and AI match recommendations
          </p>
        </div>
        <a
          href={CV_BUILDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md shrink-0"
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Manage Sophi CV →</span>
        </a>
      </div>

      {/* Tabs Control */}
      <div className="border-b border-slate-200 flex space-x-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all shrink-0 ${
            activeTab === 'applications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>My Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all shrink-0 ${
            activeTab === 'saved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          <span>Saved Jobs ({savedJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recommended')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all shrink-0 ${
            activeTab === 'recommended' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Recommended ({recommendedJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all shrink-0 ${
            activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>My Profile</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[350px]">
        {/* Tab 1: Applications */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold">
                    <tr>
                      <th className="px-6 py-4">Job Title & Company</th>
                      <th className="px-6 py-4">Applied Date</th>
                      <th className="px-6 py-4">Match Score</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/jobs/${app.jobs?.id}`} className="font-bold text-slate-900 hover:text-blue-600 text-sm">
                            {app.jobs?.title || 'Unknown Role'}
                          </Link>
                          <div className="text-[11px] text-slate-500">{app.jobs?.company_name} · {app.jobs?.location_city}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-blue-600 text-sm">{app.match_score || 75}%</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/jobs/${app.jobs?.id}`} className="text-blue-600 font-bold hover:underline flex items-center justify-end gap-1">
                            View <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
                <Briefcase className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-800">You haven&apos;t submitted any job applications yet.</p>
                <Link href="/jobs" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 inline-block">
                  Browse Jobs Now →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Jobs */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedJobs.map(job => (
                  <JobCard key={job.id} job={job} isSaved={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
                <Bookmark className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-800">No saved job bookmarks yet.</p>
                <Link href="/jobs" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 inline-block">
                  Explore Jobs to Save
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recommended Jobs */}
        {activeTab === 'recommended' && (
          <div className="space-y-4">
            {recommendedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedJobs.map(rec => (
                  <JobCard key={rec.id} job={{ ...rec.jobs, match_score: rec.match_score }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
                <Sparkles className="h-10 w-10 text-amber-400 mx-auto" />
                <p className="text-sm font-bold text-slate-800">No recommendations generated yet.</p>
                <p className="text-xs text-slate-500">Transform a CV on Sophi CV Builder to automatically get AI-matched jobs!</p>
                <a href={CV_BUILDER_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 inline-block">
                  Optimize CV on joinsophi.com →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Applicant Profile</h2>
            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-400 uppercase">Full Name / Email</label>
                <div className="text-slate-900 text-sm font-bold mt-0.5">{user?.email}</div>
              </div>
              <div>
                <label className="text-slate-400 uppercase">Account Status</label>
                <div className="text-emerald-600 font-bold mt-0.5">Verified Sophi Candidate</div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <a
                  href={CV_BUILDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
                >
                  Manage your Sophi CV on joinsophi.com <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
