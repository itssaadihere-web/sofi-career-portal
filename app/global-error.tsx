'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Silently report the system error to support@joinsophi.com
    fetch('/api/report-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errorMessage: error.message || 'Global System Exception',
        errorStack: error.stack,
        url: typeof window !== 'undefined' ? window.location.href : 'Server Side Global Error',
        additionalContext: { digest: error.digest }
      })
    }).catch(err => console.error('Silent error report dispatch failed:', err))
  }, [error])

  return (
    <html>
      <body className="bg-slate-50 text-slate-800 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mx-auto max-w-md text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-center">
            <Logo width={120} height={40} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">Something Went Wrong</h1>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              We encountered a temporary system hiccup. Our technical support team has been automatically notified and is resolving it.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full py-3 rounded-xl bg-primary-950 text-gold-300 font-extrabold text-xs hover:bg-primary-900 transition-all shadow-md"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
