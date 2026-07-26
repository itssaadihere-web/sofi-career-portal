'use client'

import { useState, useEffect } from 'react'
import { getCompanyLogoUrl } from '@/lib/brands'

interface CompanyLogoProps {
  companyName: string
  logoUrl?: string
  className?: string
  sizeClassName?: string
}

export default function CompanyLogo({
  companyName,
  logoUrl,
  className = '',
  sizeClassName = 'h-12 w-12 text-base',
}: CompanyLogoProps) {
  const initialSrc = logoUrl || getCompanyLogoUrl(companyName)
  const [src, setSrc] = useState(initialSrc)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const resolved = logoUrl || getCompanyLogoUrl(companyName)
    setSrc(resolved)
    setHasError(false)
  }, [logoUrl, companyName])

  const handleError = () => {
    setHasError(true)
  }

  // Generate 2-letter uppercase initials (e.g. "Qualix Solution Pakistan" -> "QS")
  const words = (companyName || 'Company')
    .trim()
    .split(/\s+/)
    .filter((w) => !['pakistan', 'ltd', 'limited', 'inc', 'pvt'].includes(w.toLowerCase()))

  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (companyName || 'CO').substring(0, 2).toUpperCase()

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-1 overflow-hidden shadow-2xs ${sizeClassName} ${className}`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={companyName}
          className="h-full w-full object-contain"
          onError={handleError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white font-extrabold tracking-tight shadow-inner">
          <span>{initials}</span>
        </div>
      )}
    </div>
  )
}
