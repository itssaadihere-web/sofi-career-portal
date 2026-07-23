'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase'
import JobCard from '@/components/JobCard'
import { Search, MapPin, Sparkles, Building2, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react'

export default function Homepage() {
  const router = useRouter()
  const supabase = getClientSupabase()

  const [keyword, setKeyword] = useState('')
  const [city, setCity] = useState('')
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([])
  const [stats, setStats] = useState({
    activeJobs: 120,
    companies: 45,
    professionals: 3500,
    cvsOptimized: 4800,
  })

  const CV_BUILDER_URL = process.env.NEXT_PUBLIC_CV_BUILDER_URL || 'https://joinsophi.com'

  useEffect(() => {
    async function loadData() {
      // Fetch featured or active jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6)

      if (jobs) setFeaturedJobs(jobs)

      // Fetch live stats counts
      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: companyCount } = await supabase
        .from('recruiter_profiles')
        .select('*', { count: 'exact', head: true })

      if (jobCount) setStats(prev => ({ ...prev, activeJobs: jobCount }))
      if (companyCount) setStats(prev => ({ ...prev, companies: companyCount }))
    }

    loadData()
  }, [supabase])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (keyword) query.set('q', keyword)
    if (city) query.set('city', city)
    router.push(`/jobs?${query.toString()}`)
  }

  const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Remote']
  const INDUSTRIES = [
    { name: 'Technology & IT', count: '140+ jobs' },
    { name: 'Finance & Banking', count: '65+ jobs' },
    { name: 'Marketing & Sales', count: '90+ jobs' },
    { name: 'Engineering', count: '45+ jobs' },
    { name: 'Healthcare', count: '30+ jobs' },
    { name: 'Customer Support', count: '85+ jobs' },
  ]

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 text-xs font-bold text-blue-200 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>AI-POWERED CAREER MATCHING</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Find Your Next Opportunity — <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Powered by AI CV Matching
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-medium">
            Upload your Sophi CV and instantly see how well you match every job listing. No guesswork, no generic applications.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleSearch}
            className="mx-auto max-w-3xl rounded-2xl bg-white/95 p-3 shadow-2xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-12 gap-2 border border-white/20 text-slate-800"
          >
            <div className="sm:col-span-5 flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skill, or keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold focus:outline-none placeholder-slate-400"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold focus:outline-none text-slate-700 cursor-pointer"
              >
                <option value="">All Cities / Remote</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="sm:col-span-3 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-xs sm:text-sm text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              Search Jobs
            </button>
          </form>

          {/* Two CTAs side by side */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/jobs"
              className="px-6 py-3 rounded-xl bg-white text-slate-900 font-extrabold text-sm hover:bg-slate-100 transition-all shadow-md"
            >
              Find Jobs
            </Link>
            <Link
              href="/recruiter"
              className="px-6 py-3 rounded-xl bg-blue-500/30 border border-blue-400/40 text-white font-extrabold text-sm hover:bg-blue-500/40 transition-all"
            >
              Post a Job (Recruiters)
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 text-center">
          <div>
            <div className="text-3xl font-black text-blue-600">{stats.activeJobs}+</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Active Jobs</div>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-600">{stats.companies}+</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Companies Hiring</div>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-600">{stats.professionals.toLocaleString()}+</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Professionals Matched</div>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-600">{stats.cvsOptimized.toLocaleString()}+</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">CVs Optimized via Sophi</div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Featured Job Opportunities</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Handpicked opportunities from top employers</p>
          </div>
          <Link href="/jobs" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-white border border-slate-200">
            <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No active job listings found right now.</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon or post the first job!</p>
          </div>
        )}
      </section>

      {/* Top Industries Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 text-center">Browse by Top Industries</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind.name}
              href={`/jobs?industry=${encodeURIComponent(ind.name)}`}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all text-center group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1">{ind.name}</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{ind.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works — Seekers & Recruiters */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">How Sophi Platform Works</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
              Connecting ATS-ready job seekers with forward-thinking employers in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Optimize Your CV</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Use Sophi AI at joinsophi.com to analyze your CV against target job roles and extract top ATS keywords.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-lg">See Real Match Scores</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Browse listings on Sophi Careers. Our algorithm calculates instant keyword match percentages for every role.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-lg">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Apply in One Click</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Submit your optimized Sophi CV directly to recruiters. Get notified as soon as your application status changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Recruiters Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold text-blue-200">
              EMPLOYER PORTAL
            </span>
            <h2 className="text-3xl font-black leading-tight">Post Your Job & Reach Verified ATS Talent</h2>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
              Stop sifting through hundreds of irrelevant CVs. Sophi automatically scores applicants so you interview top matches first.
            </p>
          </div>
          <Link
            href="/recruiter"
            className="px-8 py-4 rounded-2xl bg-white text-blue-900 font-black text-sm hover:bg-slate-100 transition-all shadow-lg shrink-0"
          >
            Post a Job Free →
          </Link>
        </div>
      </section>
    </div>
  )
}
