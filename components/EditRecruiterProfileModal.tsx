'use client'

import { useState } from 'react'
import { X, Loader2, Save, User, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import CompanyBrandAutocomplete from '@/components/CompanyBrandAutocomplete'

interface EditRecruiterProfileModalProps {
  recruiter: any
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProfile: any) => void
}

export default function EditRecruiterProfileModal({
  recruiter,
  isOpen,
  onClose,
  onSuccess,
}: EditRecruiterProfileModalProps) {
  const [fullName, setFullName] = useState(recruiter?.full_name || '')
  const [companyName, setCompanyName] = useState(recruiter?.company_name || '')
  const [companyLogoUrl, setCompanyLogoUrl] = useState(recruiter?.company_logo_url || '')
  const [industry, setIndustry] = useState(recruiter?.industry || 'Technology & IT')
  const [companySize, setCompanySize] = useState(recruiter?.company_size || '11-50')
  const [locationCity, setLocationCity] = useState(recruiter?.location_city || 'Karachi')
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !companyName.trim()) {
      toast.error('Full Name and Company Name are required')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/recruiter/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recruiterId: recruiter.id,
          fullName: fullName.trim(),
          companyName: companyName.trim(),
          companyLogoUrl,
          industry,
          companySize,
          locationCity,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')

      toast.success('Recruiter profile updated successfully!')
      onSuccess(data.profile)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Edit Recruiter Profile</h2>
              <p className="text-xs text-slate-500 font-medium">Update account and company brand details</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-600">Registered Company / Brand Name *</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="Technology & IT">Technology & IT</option>
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Marketing & Sales">Marketing & Sales</option>
                <option value="Engineering">Engineering</option>
                <option value="Healthcare">Healthcare</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="1-10">1-10 Employees</option>
                <option value="11-50">11-50 Employees</option>
                <option value="51-200">51-200 Employees</option>
                <option value="201-500">201-500 Employees</option>
                <option value="500+">500+ Employees</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-600">City / Location</label>
            <select
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 focus:outline-none"
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
