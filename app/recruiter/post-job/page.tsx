'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase'
import { Building2, Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle2, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PostJobPage() {
  const router = useRouter()
  const supabase = getClientSupabase()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [recruiter, setRecruiter] = useState<any>(null)

  // Form State
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

  const [applyViaSophi, setApplyViaSophi] = useState(true)
  const [applicationEmail, setApplicationEmail] = useState('')

  useEffect(() => {
    async function checkRecruiter() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please sign in as a recruiter to post jobs')
        router.push('/auth/login?redirect=/recruiter/post-job')
        return
      }

      const { data: recProfile } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!recProfile) {
        toast.error('Recruiter profile not found. Please register your company.')
        router.push('/recruiter')
        return
      }

      setRecruiter(recProfile)
      setApplicationEmail(recProfile.email)
      setLoading(false)
    }

    checkRecruiter()
  }, [supabase, router])

  const handlePublish = async () => {
    if (!title || !description) {
      toast.error('Please fill in required fields: Job Title and Description')
      return
    }

    setPublishing(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recruiterId: recruiter.id,
          companyName: recruiter.company_name,
          title,
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
          applyViaSophi,
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to publish job')

      toast.success('Job published successfully! ATS keywords extracted.')
      router.push('/recruiter/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Error publishing job')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Checking recruiter account permissions...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Post a New Job</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Employer: <strong className="text-slate-700">{recruiter?.company_name}</strong> · Credits Remaining: <strong className="text-blue-600">{recruiter?.job_post_credits || 0}</strong>
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-2 text-xs font-extrabold">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
          <span className="w-6 h-0.5 bg-slate-200" />
          <span className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
          <span className="w-6 h-0.5 bg-slate-200" />
          <span className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
        </div>
      </div>

      {/* STEP 1: Job Details */}
      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Step 1 — Role & Location Details</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full Stack Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-600">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="Technology & IT">Technology & IT</option>
                  <option value="Finance & Banking">Finance & Banking</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Healthcare">Healthcare</option>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-600">Experience Level</label>
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
                <label className="text-xs font-bold uppercase text-slate-600">Min Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={experienceMin}
                  onChange={(e) => setExperienceMin(Number(e.target.value))}
                  className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600">Max Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={experienceMax}
                  onChange={(e) => setExperienceMax(Number(e.target.value))}
                  className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                if (!title) toast.error('Job Title is required')
                else setStep(2)
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md"
            >
              <span>Next: Job Description</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Job Content & Salary */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Step 2 — Job Description & Compensation</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Full Job Description *</label>
              <textarea
                rows={6}
                required
                placeholder="Describe role responsibilities, key tasks, team structure..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Key Requirements (Bulleted)</label>
              <textarea
                rows={4}
                placeholder="• 3+ years experience with React and Node.js..."
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

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (!description) toast.error('Job Description is required')
                else setStep(3)
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md"
            >
              <span>Next: Application Settings</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Settings & Confirm */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Step 3 — Application Settings & Kimi AI Keyword Extraction</h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed font-medium">
                <strong>AI Keyword Extraction Active:</strong> When you publish, Sophi&apos;s Kimi AI engine will automatically scan your job description to extract top 15 ATS keywords for candidate matching.
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Application Delivery Email</label>
              <input
                type="email"
                value={applicationEmail}
                onChange={(e) => setApplicationEmail(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-60"
            >
              {publishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              <span>Publish Job Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
