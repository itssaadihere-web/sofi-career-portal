'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Building2, Bookmark, CheckCircle2, DollarSign, Clock } from 'lucide-react'

export interface JobCardProps {
  job: {
    id: string
    title: string
    company_name: string
    company_logo_url?: string
    location_city?: string
    location_type?: string
    employment_type?: string
    salary_min?: number
    salary_max?: number
    salary_visible?: boolean
    published_at?: string
    featured?: boolean
    is_verified?: boolean
    match_score?: number
  }
  isSaved?: boolean
  onToggleSave?: (jobId: string) => void
}

export default function JobCard({ job, isSaved = false, onToggleSave }: JobCardProps) {
  const [saved, setSaved] = useState(isSaved)

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSaved(!saved)
    if (onToggleSave) onToggleSave(job.id)
  }

  // Location badge color styling
  const locationBadgeClass = {
    remote: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hybrid: 'bg-blue-50 text-blue-700 border-blue-200',
    onsite: 'bg-slate-100 text-slate-700 border-slate-200',
  }[(job.location_type || 'onsite').toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200'

  const formattedSalary = job.salary_visible && job.salary_min && job.salary_max
    ? `PKR ${(job.salary_min / 1000).toFixed(0)}k – ${(job.salary_max / 1000).toFixed(0)}k / mo`
    : null

  const daysAgo = job.published_at
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(job.published_at).getTime()) / (1000 * 3600 * 24)))
    : 0

  return (
    <div className={`relative flex flex-col justify-between p-5 rounded-2xl border bg-white transition-all hover:shadow-md hover:border-blue-300 group ${
      job.featured ? 'border-blue-400 bg-gradient-to-r from-blue-50/20 to-white' : 'border-slate-200'
    }`}>
      {job.featured && (
        <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
          ★ Featured Role
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Company Logo or Fallback Initials */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-base overflow-hidden">
              {job.company_logo_url ? (
                <img src={job.company_logo_url} alt={job.company_name} className="h-full w-full object-cover" />
              ) : (
                job.company_name.substring(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <Link href={`/jobs/${job.id}`} className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                {job.title}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                <span>{job.company_name}</span>
                {job.is_verified && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" aria-label="Verified Employer" />
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveClick}
            className={`p-2 rounded-xl border transition-colors shrink-0 ${
              saved
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-50'
            }`}
            title={saved ? 'Remove Bookmark' : 'Bookmark Job'}
          >
            <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Location & Employment Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-semibold">
          <span className="flex items-center gap-1 text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {job.location_city || 'Pakistan'}
          </span>

          <span className={`px-2.5 py-0.5 rounded-full border capitalize ${locationBadgeClass}`}>
            {job.location_type || 'Onsite'}
          </span>

          {job.employment_type && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
              {job.employment_type}
            </span>
          )}

          {formattedSalary && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              <DollarSign className="h-3 w-3" />
              {formattedSalary}
            </span>
          )}
        </div>
      </div>

      {/* Footer bar of Card */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 text-xs">
        <span className="flex items-center gap-1 text-slate-400 font-medium">
          <Clock className="h-3.5 w-3.5" />
          {daysAgo === 0 ? 'Posted today' : `${daysAgo}d ago`}
        </span>

        <div className="flex items-center gap-3">
          {job.match_score !== undefined && job.match_score > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs">
              <span>{job.match_score}% Match</span>
            </div>
          )}

          <Link
            href={`/jobs/${job.id}`}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
