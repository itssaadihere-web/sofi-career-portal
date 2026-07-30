'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase'
import { ArrowLeft, Save, Loader2, Building2, Trash2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import CompanyBrandAutocomplete from '@/components/CompanyBrandAutocomplete'

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const supabase = getClientSupabase()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [postedByRecruiterId, setPostedByRecruiterId] = useState('')

  // Form State
  const [companyName, setCompanyName] = useState('')
  const [companyLogoUrl, setCompanyLogoUrl] = useState('')
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [locationCity, setLocationCity] = useState('Karachi')
  const [locationType, setLocationType] = useState('onsite')
  const [employmentType, setEmploymentType] = useState('full-time')
  const [industry, setIndustry] = useState('Technology & IT')
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [experienceMin, setExperienceMin] = useState(1)
  const [experienceMax, setExperienceMax] = useState(3)

  const [description, setDescription] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [requirements, setRequirements] = useState('')
  const [benefits, setBenefits] = useState('')
  const [salaryMin, setSalaryMin] = useState(100000)
  const [salaryMax, setSalaryMax] = useState(200000)
  const [salaryVisible, setSalaryVisible] = useState(true)
  const [status, setStatus] = useState('active')

  useEffect(() => {
    async function loadJob() {
      if (!jobId) return

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please sign in as a recruiter to edit job postings')
        router.push('/auth/login')
        return
      }

      const res = await fetch(`/api/jobs/${jobId}`)
      const data = await res.json()

      if (!res.ok || !data.job) {
        toast.error('Job post not found')
        router.push('/recruiter/dashboard')
        return
      }

      const j = data.job
      setPostedByRecruiterId(j.recruiter_id || '')
      setTitle(j.title || '')
      setCompanyName(j.company_name || '')
      setCompanyLogoUrl(j.company_logo_url || '')
      setDepartment(j.department || '')
      setLocationCity(j.location_city || 'Karachi')
      setLocationType(j.location_type || 'onsite')
      setEmploymentType(j.employment_type || 'full-time')
      setIndustry(j.industry || 'Technology & IT')
      setExperienceLevel(j.experience_level || 'mid')
      setExperienceMin(j.experience_years_min || 0)
      setExperienceMax(j.experience_years_max || 3)

      setDescription(j.description || '')
      setResponsibilities(j.responsibilities || '')
      setRequirements(j.requirements || '')
      setBenefits(j.benefits || '')
      setSalaryMin(j.salary_min || 100000)
      setSalaryMax(j.salary_max || 200000)
      setSalaryVisible(j.salary_visible ?? true)
      setStatus(j.status || 'active')

      setLoading(false)
    }

    loadJob()
  }, [jobId, supabase, router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !companyName) {
      toast.error('Job Title, Company Name, and Description are required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          companyName,
          companyLogoUrl,
          department,
          locationCity,
          locationType,
          employmentType,
          industry,
          experienceLevel,
          experienceYearsMin: Number(experienceMin),
          experienceYearsMax: Number(experienceMax),
          salaryMin: Number(salaryMin),
          salaryMax: Number(salaryMax),
          salaryVisible,
          description,
          responsibilities,
          requirements,
          benefits,
          status,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update job post')

      toast.success('Job posting updated successfully!')
      router.push('/recruiter/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Error updating job post')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job listing? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete job post')

      toast.success('Job listing deleted')
      router.push('/recruiter/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Error deleting job')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading job post details...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/recruiter/dashboard')}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">Edit Job Listing</h1>
            <p className="text-xs text-slate-500 font-medium">Update role requirements, company details, or status</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100 transition-colors"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          <span>Delete Job</span>
        </button>
      </div>

      <form onSubmit={handleUpdate} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {/* Admin Poster Recruiter Info Banner */}
        {postedByRecruiterId && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3 text-xs font-semibold text-purple-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
              <span>Job Posted By (Recruiter ID):</span>
              <code className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-mono text-[11px] font-bold border border-purple-300">
                {postedByRecruiterId}
              </code>
            </div>
            <span className="text-[10px] text-purple-700 font-extrabold uppercase tracking-wider bg-purple-200/60 px-2 py-0.5 rounded-full">
              Admin Access
            </span>
          </div>
        )}

        {/* Company & Role Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase text-slate-400 border-b border-slate-100 pb-2">1. Hiring Company & Role Title</h2>

          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Company Name & Logo *</label>
            <CompanyBrandAutocomplete
              required
              value={companyName}
              logoUrl={companyLogoUrl}
              onChange={(name, logo) => {
                setCompanyName(name)
                setCompanyLogoUrl(logo)
              }}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Job Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="Technology & IT">Technology & IT</option>
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Marketing & Sales">Marketing & Sales</option>
                <option value="Engineering">Engineering</option>
                <option value="Healthcare">Healthcare</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none capitalize"
              >
                <option value="active">Active (Public)</option>
                <option value="closed">Closed / Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600">City</label>
              <select
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="Karachi">Karachi</option>
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Work Setup</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none capitalize"
              >
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none capitalize"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description & Salary */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase text-slate-400 border-b border-slate-100 pb-2">2. Description & Compensation</h2>

          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Full Job Description *</label>
            <textarea
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Requirements (Bulleted)</label>
            <textarea
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Salary Min (PKR / Month)</label>
              <input
                type="number"
                step="10000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Salary Max (PKR / Month)</label>
              <input
                type="number"
                step="10000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={salaryVisible}
              onChange={(e) => setSalaryVisible(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Display salary range publicly on job card</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push('/recruiter/dashboard')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 transition-colors shadow-md disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Job Changes</span>
          </button>
        </div>
      </form>
    </div>
  )
}
