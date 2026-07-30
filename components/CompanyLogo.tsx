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
  const googleCdnUrl = getCompanyLogoUrl(companyName, domain)

  // Use stored logoUrl if it exists and is not a known broken clearbit URL, otherwise use Google CDN
  const isBrokenClearbit = logoUrl && logoUrl.includes('logo.clearbit.com')
  const initialSrc = (logoUrl && !isBrokenClearbit) ? logoUrl : googleCdnUrl

  const [src, setSrc] = useState(initialSrc)
  const [errorCount, setErrorCount] = useState(0)

  useEffect(() => {
    const resolvedDomain = getDomainForCompany(companyName)
    const computed = getCompanyLogoUrl(companyName, resolvedDomain)
    const nextSrc = (logoUrl && !logoUrl.includes('logo.clearbit.com')) ? logoUrl : computed
    setSrc(nextSrc)
    setErrorCount(0)
  }, [logoUrl, companyName])

  const handleError = () => {
    if (errorCount === 0) {
      // Try Google 256px Favicon CDN
      setSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`)
      setErrorCount(1)
    } else if (errorCount === 1) {
      // Try DuckDuckGo 128px Icon CDN
      setSrc(`https://icons.duckduckgo.com/ip3/${domain}.ico`)
      setErrorCount(2)
    } else if (errorCount === 2) {
      // Try Clearbit Logo
      setSrc(`https://logo.clearbit.com/${domain}`)
      setErrorCount(3)
    } else if (errorCount === 3) {
      // Try IconHorse
      setSrc(`https://icon.horse/icon/${domain}`)
      setErrorCount(4)
    } else {
      // Final fallback: gradient badge
      setErrorCount(5)
    }
  }

  // Initial calculation for initials fallback if all 4 CDNs fail
  const words = (companyName || 'Company')
    .trim()
    .split(/\s+/)
    .filter((w) => !['pakistan', 'ltd', 'limited', 'inc', 'pvt', 'the'].includes(w.toLowerCase()))

  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (companyName || 'CO').substring(0, 2).toUpperCase()

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-1 overflow-hidden shadow-2xs ${sizeClassName} ${className}`}
    >
      {src && errorCount < 5 ? (
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
