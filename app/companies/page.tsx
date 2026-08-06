'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getClientSupabase } from '@/lib/supabase'
import CompanyLogo from '@/components/CompanyLogo'
import { Building2, Briefcase, MapPin, Search, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

export default function CompaniesPage() {
  const supabase = getClientSupabase()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadCompanies() {
      // Fetch verified recruiters & active hiring companies
      const { data: recs } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .order('company_name', { ascending: true })

      const { data: activeJobs } = await supabase
        .from('jobs')
        .select('company_name, location_city, industry')
        .eq('status', 'active')

      const companyMap = new Map<string, any>()

      if (recs) {
        recs.forEach((r) => {
          if (r.company_name) {
            companyMap.set(r.company_name.toLowerCase().trim(), {
              name: r.company_name,
              logo: r.company_logo_url,
              role: r.role || 'Employer',
              verified: true,
              jobCount: 0,
            })
          }
        })
      }

      if (activeJobs) {
        activeJobs.forEach((j) => {
          if (j.company_name) {
            const key = j.company_name.toLowerCase().trim()
            if (companyMap.has(key)) {
              companyMap.get(key).jobCount += 1
            } else {
              companyMap.set(key, {
                name: j.company_name,
                logo: null,
                role: 'Employer',
                verified: false,
                jobCount: 1,
              })
            }
          }
        })
      }

      setCompanies(Array.from(companyMap.values()))
      setLoading(false)
    }

    loadCompanies()
  }, [supabase])

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-10 rounded-3xl text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-300 border border-blue-400/20">
          <Building2 className="h-3.5 w-3.5 text-amber-400" /> Top Hiring Employers
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          Explore Leading Companies Hiring in Pakistan
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-medium leading-relaxed">
          Connect with top employers across tech, finance, engineering, and corporate sectors. Find companies looking for pre-vetted, ATS-optimized talent matched via Sophi AI.
        </p>

        {/* Search Bar */}
        <div className="pt-2 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search company by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">
            Employer Directory ({filteredCompanies.length})
          </h2>
          <span className="text-xs font-semibold text-slate-500">Verified Recruiter Profiles</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-36 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
            <Building2 className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No companies found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No hiring companies match your search criteria. Try a different keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((comp) => (
              <div
                key={comp.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  <CompanyLogo
                    companyName={comp.name}
                    logoUrl={comp.logo}
                    sizeClassName="h-12 w-12 text-sm shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-slate-900 text-base truncate">{comp.name}</h3>
                      {comp.verified && (
                        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {comp.jobCount > 0 ? (
                        <span className="text-emerald-600 font-bold">{comp.jobCount} active job{comp.jobCount > 1 ? 's' : ''}</span>
                      ) : (
                        <span>Actively reviewing candidates</span>
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/jobs?q=${encodeURIComponent(comp.name)}`}
                  className="flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700 pt-3 border-t border-slate-100"
                >
                  <span>View Company Jobs</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recruiter CTA Banner */}
      <div className="rounded-2xl bg-slate-900 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">Are you a recruiter hiring in Pakistan or Gulf?</h3>
          <p className="text-xs text-slate-300">
            Post your job listings and receive ATS-scored candidates with detailed gap analysis reports.
          </p>
        </div>
        <Link
          href="/recruiter/post-job"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white shadow-md shrink-0 transition-colors"
        >
          Post a Job Now →
        </Link>
      </div>
    </div>
  )
}
