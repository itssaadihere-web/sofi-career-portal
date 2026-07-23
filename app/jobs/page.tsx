'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase'
import JobCard from '@/components/JobCard'
import { Search, Filter, RotateCcw, Briefcase, Loader2 } from 'lucide-react'

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
  const [sortBy, setSortBy] = useState('recent')

  // Jobs data
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
            j =>
              j.title.toLowerCase().includes(kw) ||
              j.company_name.toLowerCase().includes(kw) ||
              (j.description && j.description.toLowerCase().includes(kw)) ||
              (j.keywords && j.keywords.some((k: string) => k.toLowerCase().includes(kw)))
          )
        }

        if (locationTypes.length > 0) {
          filtered = filtered.filter(j => locationTypes.includes((j.location_type || '').toLowerCase()))
        }

        if (employmentTypes.length > 0) {
          filtered = filtered.filter(j => employmentTypes.includes((j.employment_type || '').toLowerCase()))
        }

        if (expLevels.length > 0) {
          filtered = filtered.filter(j => expLevels.includes((j.experience_level || '').toLowerCase()))
        }

        setJobs(filtered)
      } else {
        setJobs([])
      }

      setLoading(false)
    }

    loadJobs()
  }, [supabase, selectedCity, selectedIndustry, minSalary, sortBy, keyword, locationTypes, employmentTypes, expLevels])

  const toggleLocationType = (type: string) => {
    setLocationTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleEmploymentType = (type: string) => {
    setEmploymentTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleExpLevel = (level: string) => {
    setExpLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  const clearFilters = () => {
    setKeyword('')
    setSelectedCity('')
    setSelectedIndustry('')
    setLocationTypes([])
    setEmploymentTypes([])
    setExpLevels([])
    setMinSalary(0)
    router.push('/jobs')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">Explore Active Job Openings</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Search and filter 500+ verified positions matching your professional profile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
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
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">City / Location</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Locations</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Location Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Work Setup</label>
            <div className="space-y-1.5">
              {LOCATION_TYPES.map(t => (
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
              {EMPLOYMENT_TYPES.map(t => (
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

          {/* Industry Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Industries</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Experience Level</label>
            <div className="space-y-1.5">
              {EXP_LEVELS.map(l => (
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
              <span className="text-blue-600 font-extrabold">{minSalary > 0 ? `PKR ${(minSalary/1000).toFixed(0)}k+` : 'Any'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="25000"
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </aside>

        {/* Main Jobs Listing Area */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-extrabold text-slate-700">
              Showing <span className="text-blue-600">{jobs.length}</span> open roles
            </span>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="salary">Salary: High to Low</option>
                <option value="applications">Most Applied</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-44 bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
              <Briefcase className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No jobs match your current filters</h3>
              <p className="text-xs text-slate-500">Try broadening your search keywords or resetting city filters.</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors inline-block"
              >
                Clear All Filters
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
    <Suspense fallback={
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <JobsContent />
    </Suspense>
  )
}
