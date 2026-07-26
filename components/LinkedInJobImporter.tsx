'use client'

import { useState } from 'react'
import { Linkedin, Sparkles, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface LinkedInJobImporterProps {
  onImportSuccess: (extractedData: any) => void
}

export default function LinkedInJobImporter({ onImportSuccess }: LinkedInJobImporterProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [imported, setImported] = useState(false)

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!url.trim()) {
      toast.error('Please enter a LinkedIn job post URL')
      return
    }

    if (!url.includes('linkedin.com') && !url.startsWith('http')) {
      toast.error('Please enter a valid job post URL (e.g. https://www.linkedin.com/jobs/view/...)')
      return
    }

    setLoading(true)
    setImported(false)

    try {
      const res = await fetch('/api/jobs/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Failed to fetch job post')

      if (result.data) {
        onImportSuccess(result.data)
        setImported(true)
        toast.success('Successfully scraped LinkedIn job post details! Form populated.')
      } else {
        throw new Error('No structured job details returned from URL')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error fetching LinkedIn job details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl border border-blue-800/40">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/30 text-blue-300 ring-1 ring-blue-400/30">
            <Linkedin className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Import Existing LinkedIn Job Post</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-300 border border-blue-400/30 uppercase tracking-wide">
                <Sparkles className="h-3 w-3 text-amber-400" /> Auto-Fill
              </span>
            </div>
            <p className="mt-1 text-xs text-blue-200/80">
              Paste your active LinkedIn job post link to scrape and auto-fill role, details, requirements & compensation.
            </p>
          </div>
        </div>

        {imported && (
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <span>Job Details Imported</span>
          </div>
        )}
      </div>

      <form onSubmit={handleFetch} className="mt-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full">
          <input
            type="url"
            placeholder="https://www.linkedin.com/jobs/view/1234567890..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-md disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Scraping LinkedIn...</span>
            </>
          ) : (
            <>
              <span>Fetch & Auto-Fill</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
