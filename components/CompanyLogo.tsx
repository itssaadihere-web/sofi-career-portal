'use client'

import { useState, useEffect } from 'react'
import { getCompanyLogoUrl, getDomainForCompany } from '@/lib/brands'

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
  const domain = getDomainForCompany(companyName)
  const primarySrc = logoUrl || getCompanyLogoUrl(companyName, domain)

  const [src, setSrc] = useState(primarySrc)
  const [errorCount, setErrorCount] = useState(0)

  useEffect(() => {
    const resolvedDomain = getDomainForCompany(companyName)
    const resolved = logoUrl || getCompanyLogoUrl(companyName, resolvedDomain)
    setSrc(resolved)
    setErrorCount(0)
  }, [logoUrl, companyName])

  const handleError = () => {
    if (errorCount === 0) {
      // Secondary CDN: Clearbit logo
      setSrc(`https://logo.clearbit.com/${domain}`)
      setErrorCount(1)
    } else if (errorCount === 1) {
      // Tertiary CDN: IconHorse
      setSrc(`https://icon.horse/icon/${domain}`)
      setErrorCount(2)
    } else {
      // Final fallback: gradient badge
      setErrorCount(3)
    }
  }

  // Initial calculation for initials fallback if all 3 CDNs fail
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
      {src && errorCount < 3 ? (
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
