'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase'
import JobCard from '@/components/JobCard'
import GoogleAd from '@/components/GoogleAd'
import { Search, Filter, RotateCcw, Briefcase, Loader2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { calculateMatchScore } from '@/lib/matchEngine'

function getPaginationRange(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, '...', current - 1, current, current + 1, '...', total]
}

function JobsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getClientSupabase()

  // Filter States
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '')
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get('industry') || '')
  const [locationTypes, setLocationTypes] = useState<string[]>([])
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([])
  const [expLevels, setExpLevels] = useState<string[]>([])
  const [minSalary, setMinSalary] = useState(0)
  const [sortBy, setSortBy] = useState('matched')

  // Pagination States
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // User CV & Jobs data
  const [latestCvJob, setLatestCvJob] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Remote']
  const INDUSTRIES = ['Technology & IT', 'Finance & Banking', 'Marketing & Sales', 'Engineering', 'Healthcare', 'Customer Support']
  const LOCATION_TYPES = [
    { id: 'remote', label: 'Remote' },
    { id: 'onsite', label: 'Onsite' },
    { id: 'hybrid', label: 'Hybrid' },
  ]
  const EMPLOYMENT_TYPES = [
    { id: 'full-time', label: 'Full-time' },
    { id: 'part-time', label: 'Part-time' },
    { id: 'contract', label: 'Contract' },
    { id: 'internship', label: 'Internship' },
  ]
  const EXP_LEVELS = [
    { id: 'entry', label: 'Entry Level' },
    { id: 'mid', label: 'Mid Level' },
    { id: 'senior', label: 'Senior Level' },
    { id: 'lead', label: 'Lead / Director' },
  ]

  // Fetch logged in user's latest CV created on joinsophi.com
  useEffect(() => {
    async function fetchUserCV() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: cv } = await supabase
          .from('cv_jobs')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (cv) {
          setLatestCvJob(cv)
        }
      }
    }

    fetchUserCV()
  }, [supabase])

  useEffect(() => {
    async function loadJobs() {
      setLoading(true)

      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())

      if (selectedCity) query = query.ilike('location_city', `%${selectedCity}%`)
      if (selectedIndustry) query = query.eq('industry', selectedIndustry)
      if (minSalary > 0) query = query.gte('salary_max', minSalary)

      if (sortBy === 'recent') {
        query = query.order('published_at', { ascending: false })
      } else if (sortBy === 'salary') {
        query = query.order('salary_max', { ascending: false })
      } else if (sortBy === 'applications') {
        query = query.order('applications_count', { ascending: false })
      }

      const { data, error } = await query

      if (!error && data) {
        let filtered = data

        if (keyword.trim()) {
          const kw = keyword.toLowerCase()
          filtered = filtered.filter(
            (j) =>
              j.title.toLowerCase().includes(kw) ||
              j.company_name.toLowerCase().includes(kw) ||
              (j.description && j.description.toLowerCase().includes(kw)) ||
              (j.keywords && j.keywords.some((k: string) => k.toLowerCase().includes(kw)))
          )
        }

        if (locationTypes.length > 0) {
          filtered = filtered.filter((j) => locationTypes.includes((j.location_type || '').toLowerCase()))
        }

        if (employmentTypes.length > 0) {
          filtered = filtered.filter((j) => employmentTypes.includes((j.employment_type || '').toLowerCase()))
        }

        if (expLevels.length > 0) {
          filtered = filtered.filter((j) => expLevels.includes((j.experience_level || '').toLowerCase()))
        }

        // Calculate accurate match score for every job using unified match engine
        filtered = filtered.map((j) => {
          const matchResult = calculateMatchScore(j, latestCvJob)
          return {
            ...j,
            match_score: matchResult.score,
          }
        })

        // Sort by Most Matched (highest match_score first)
        if (sortBy === 'matched') {
          filtered.sort((a, b) => {
            const scoreA = a.match_score !== null ? a.match_score : -1
            const scoreB = b.match_score !== null ? b.match_score : -1
            return scoreB - scoreA
          })
        }

        setJobs(filtered)
      } else {
        setJobs([])
      }

      setCurrentPage(1)
      setLoading(false)
    }

    loadJobs()
  }, [
    supabase,
    keyword,
    selectedCity,
    selectedIndustry,
    locationTypes,
    employmentTypes,
    expLevels,
    minSalary,
    sortBy,
    latestCvJob,
  ])

  const toggleLocationType = (type: string) => {
    setLocationTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
    setCurrentPage(1)
  }

  const toggleEmploymentType = (type: string) => {
    setEmploymentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
    setCurrentPage(1)
  }

  const toggleExpLevel = (level: string) => {
    setExpLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setKeyword('')
    setSelectedCity('')
    setSelectedIndustry('')
    setLocationTypes([])
    setEmploymentTypes([])
    setExpLevels([])
    setMinSalary(0)
    setSortBy('matched')
    setCurrentPage(1)
  }

  // Pagination calculation
  const totalJobs = jobs.length
  const totalPages = Math.ceil(totalJobs / pageSize) || 1
  const startIdx = (currentPage - 1) * pageSize
  const endIdx = Math.min(startIdx + pageSize, totalJobs)
  const paginatedJobs = jobs.slice(startIdx, endIdx)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-400/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> AI-Matched Career Opportunities
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">Explore Jobs in Pakistan</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
            Discover roles matched directly against your latest Sophi CV created on joinsophi.com.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              Filter Jobs
            </span>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset All
            </button>
          </div>

          {/* Keyword Search */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Keywords</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Title, skills, company..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-transparent text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">City / Location</label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Locations</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Location Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Work Setup</label>
            <div className="space-y-1.5">
              {LOCATION_TYPES.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={locationTypes.includes(t.id)}
                    onChange={() => toggleLocationType(t.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Employment Type</label>
            <div className="space-y-1.5">
              {EMPLOYMENT_TYPES.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={employmentTypes.includes(t.id)}
                    onChange={() => toggleEmploymentType(t.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Experience Level</label>
            <div className="space-y-1.5">
              {EXP_LEVELS.map((l) => (
                <label key={l.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expLevels.includes(l.id)}
                    onChange={() => toggleExpLevel(l.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{l.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Salary Min Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
              <span>Min Salary</span>
              <span className="text-blue-600 font-extrabold">{minSalary > 0 ? `PKR ${(minSalary / 1000).toFixed(0)}k+` : 'Any'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="25000"
              value={minSalary}
              onChange={(e) => {
                setMinSalary(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Sidebar Google Ad */}
          <div className="pt-2">
            <GoogleAd variant="sidebar" label="Sponsored" />
          </div>
        </aside>

        {/* Main Jobs Listing Area */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Top Google Ad Leaderboard */}
          <GoogleAd variant="leaderboard" label="Advertisement" />

          {/* Top Bar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-extrabold text-slate-700">
              Showing <span className="text-blue-600">{totalJobs > 0 ? `${startIdx + 1}–${endIdx}` : 0}</span> of <span className="text-slate-900">{totalJobs}</span> open roles
            </span>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              {/* Jobs Per Page Selector */}
              <div className="flex items-center gap-1.5">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-slate-800 focus:outline-none cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-800 focus:outline-none cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <option value="matched">Most Matched (AI Score ✨)</option>
                  <option value="recent">Most Recent</option>
                  <option value="salary">Salary: High to Low</option>
                  <option value="applications">Most Applied</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : totalJobs > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {paginatedJobs.map((job, idx) => (
                  <div key={job.id} className="space-y-4">
                    <JobCard job={job} />
                    {/* Insert Google In-Feed Ad after every 4th job card */}
                    {(idx + 1) % 4 === 0 && idx !== paginatedJobs.length - 1 && (
                      <GoogleAd variant="infeed" label="Sponsored Job Highlight" />
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-w-full overflow-hidden">
                  <span className="text-xs font-bold text-slate-500">
                    Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5 max-w-full">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                        window.scrollTo({ top: 300, behavior: 'smooth' })
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Prev</span>
                    </button>

                    {getPaginationRange(currentPage, totalPages).map((item, idx) =>
                      item === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-xs font-extrabold text-slate-400 select-none">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${item}`}
                          onClick={() => {
                            setCurrentPage(Number(item))
                            window.scrollTo({ top: 300, behavior: 'smooth' })
                          }}
                          className={`h-8 w-8 rounded-xl text-xs font-extrabold transition-all ${
                            currentPage === item
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        window.scrollTo({ top: 300, behavior: 'smooth' })
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4">
              <Briefcase className="h-12 w-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-lg">No jobs match your criteria</h3>
                <p className="text-xs text-slate-500">Try adjusting your search terms or resetting filters.</p>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  )
}
