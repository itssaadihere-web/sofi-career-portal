'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase'
import {
  ArrowLeft,
  Save,
  Loader2,
  Building2,
  Trash2,
  ShieldCheck,
  Mail,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  Tag
} from 'lucide-react'
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
  
  // Recruiter Email & Application Settings
  const [applicationEmail, setApplicationEmail] = useState('')
  const [applicationUrl, setApplicationUrl] = useState('')
  const [applyViaSophi, setApplyViaSophi] = useState(true)
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
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
      
      setApplicationEmail(j.application_email || session.user.email || '')
      setApplicationUrl(j.application_url || '')
      setApplyViaSophi(j.apply_via_sophi ?? true)
      setKeywords(Array.isArray(j.keywords) ? j.keywords : [])
      setStatus(j.status || 'active')

      setLoading(false)
    }

    loadJob()
  }, [jobId, supabase, router])

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return
    const newKw = keywordInput.trim().toLowerCase()
    if (!keywords.includes(newKw)) {
      setKeywords([...keywords, newKw])
    }
    setKeywordInput('')
  }

  const handleRemoveKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter(k => k !== kwToRemove))
  }

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
          applicationEmail,
          applicationUrl,
          applyViaSophi,
          keywords,
          status,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update job post')

      toast.success('Job posting and recruiter settings updated successfully!')
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
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading full job posting & recruiter details...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/recruiter/dashboard')}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">Edit Job Listing & Recruiter Email</h1>
            <p className="text-xs text-slate-500 font-medium">Update all details, candidate application email, and status</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100 transition-colors"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          <span>Delete Job</span>
        </button>
      </div>

      <form onSubmit={handleUpdate} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-8">
        
        {/* Admin Poster Recruiter Info Banner */}
        {postedByRecruiterId && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3 text-xs font-semibold text-purple-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
              <span>Job Posted By Recruiter ID:</span>
              <code className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-mono text-[11px] font-bold border border-purple-300">
                {postedByRecruiterId}
              </code>
            </div>
            <span className="text-[10px] text-purple-700 font-extrabold uppercase tracking-wider bg-purple-200/60 px-2 py-0.5 rounded-full">
              Full Edit Authorization
            </span>
          </div>
        )}

        {/* SECTION 1: Hiring Company & Role Title */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            1. Hiring Company & Role Title
          </h2>

          <div>
            <label className="text-xs font-extrabold uppercase text-slate-700">Company Name & Brand Logo *</label>
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
            <label className="text-xs font-extrabold uppercase text-slate-700">Job Title *</label>
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
              <label className="text-xs font-extrabold uppercase text-slate-700">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold uppercase text-slate-700">Industry</label>
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
              <label className="text-xs font-extrabold uppercase text-slate-700">Job Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none capitalize bg-slate-50"
              >
                <option value="active">Active (Public on Portal)</option>
                <option value="closed">Closed / Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Full Job Content, Requirements & Benefits */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
            2. Job Description, Responsibilities & Benefits
          </h2>

          <div>
            <label className="text-xs font-extrabold uppercase text-slate-700">Full Job Description *</label>
            <textarea
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold uppercase text-slate-700">Key Responsibilities (Bulleted)</label>
            <textarea
              rows={4}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="• Manage product roadmap & engineering sprint reviews..."
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold uppercase text-slate-700">Role Requirements (Bulleted)</label>
            <textarea
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="• 3+ years experience with Next.js & Supabase..."
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold uppercase text-slate-700">Benefits & Perks (Bulleted)</label>
            <textarea
              rows={3}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="• Health insurance, performance bonus, learning budget..."
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* SECTION 3: Experience, Compensation & Work Setup */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
            3. Experience, Compensation & Location Setup
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-extrabold uppercase text-slate-700">City</label>
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
              <label className="text-xs font-extrabold uppercase text-slate-700">Work Setup</label>
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
              <label className="text-xs font-extrabold uppercase text-slate-700">Employment Type</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-extrabold uppercase text-slate-700">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none capitalize"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead / Director</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold uppercase text-slate-700">Min Experience (Years)</label>
              <input
                type="number"
                min="0"
                value={experienceMin}
                onChange={(e) => setExperienceMin(Number(e.target.value))}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold uppercase text-slate-700">Max Experience (Years)</label>
              <input
                type="number"
                min="0"
                value={experienceMax}
                onChange={(e) => setExperienceMax(Number(e.target.value))}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold uppercase text-slate-700">Salary Min (PKR / Month)</label>
              <input
                type="number"
                step="10000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold uppercase text-slate-700">Salary Max (PKR / Month)</label>
              <input
                type="number"
                step="10000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={salaryVisible}
              onChange={(e) => setSalaryVisible(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Display salary range publicly on public job cards</span>
          </label>
        </div>

        {/* SECTION 4: Recruiter Application Email & Delivery Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            4. Recruiter Email & Application Delivery Settings
          </h2>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-4">
            <div>
              <label className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Recruiter Delivery Email (`application_email`)</span>
              </label>
              <input
                type="email"
                required
                value={applicationEmail}
                onChange={(e) => setApplicationEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full mt-1 p-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
              />
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                📧 Candidate applications and Sophi ATS match score emails for this job post will be dispatched directly to this email address.
              </p>
            </div>

            <div>
              <label className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-blue-600" />
                <span>External Application Link (Optional)</span>
              </label>
              <input
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="https://company.careers.com/job/123"
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={applyViaSophi}
                onChange={(e) => setApplyViaSophi(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>Enable 1-Click Sophi AI Application & ATS Match Scoring</span>
            </label>
          </div>
        </div>

        {/* SECTION 5: ATS Keywords */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            5. ATS Keywords for Candidate Matching ({keywords.length})
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddKeyword()
                }
              }}
              placeholder="Add ATS keyword (e.g. Next.js, Python, PostgreSQL)..."
              className="flex-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="px-4 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Add Keyword
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold capitalize"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(kw)}
                  className="text-slate-400 hover:text-red-600 font-extrabold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push('/recruiter/dashboard')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save All Job & Recruiter Changes</span>
          </button>
        </div>
      </form>
    </div>
  )
}
