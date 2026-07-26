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
  const [errorCount, setErrorCount] = useState(0)

  useEffect(() => {
    const resolved = logoUrl || getCompanyLogoUrl(companyName)
    setSrc(resolved)
    setErrorCount(0)
  }, [logoUrl, companyName])

  const handleError = () => {
    if (errorCount === 0) {
      // Try Google Favicon CDN as secondary fallback
      const cleanDomain = companyName.toLowerCase().replace(/[^\w]/g, '') + '.com'
      setSrc(`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`)
      setErrorCount(1)
    } else {
      // Final fallback: show clean uppercase initials
      setErrorCount(2)
    }
  }

  const initials = (companyName || 'CO')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 font-black text-slate-800 overflow-hidden shadow-2xs ${sizeClassName} ${className}`}
    >
      {src && errorCount < 2 ? (
        <img
          src={src}
          alt={companyName}
          className="h-full w-full object-cover"
          onError={handleError}
        />
      ) : (
        <span className="tracking-tighter">{initials}</span>
      )}
    </div>
  )
}
