'use client'

import { useState, useEffect, useRef } from 'react'
import { searchBrands, RENOWNED_BRANDS, CompanyBrand, getCompanyLogoUrl } from '@/lib/brands'
import { Building2, Check, Sparkles } from 'lucide-react'

interface CompanyBrandAutocompleteProps {
  value: string
  logoUrl?: string
  onChange: (companyName: string, logoUrl: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export default function CompanyBrandAutocomplete({
  value,
  logoUrl,
  onChange,
  placeholder = 'e.g. Systems Limited, Jazz, Meezan Bank, Google...',
  required = false,
  className = '',
}: CompanyBrandAutocompleteProps) {
  const [query, setQuery] = useState(value || '')
  const [currentLogo, setCurrentLogo] = useState(logoUrl || '')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<CompanyBrand[]>(RENOWNED_BRANDS.slice(0, 8))
  const [imgError, setImgError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    if (logoUrl) setCurrentLogo(logoUrl)
  }, [logoUrl])

  useEffect(() => {
    setResults(searchBrands(query))
  }, [query])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setQuery(text)
    setImgError(false)
    setIsOpen(true)

    // Check if typed text matches a known brand exactly
    const exact = RENOWNED_BRANDS.find((b) => b.name.toLowerCase() === text.toLowerCase().trim())
    if (exact) {
      setCurrentLogo(exact.logoUrl)
      onChange(exact.name, exact.logoUrl)
    } else {
      const generatedLogo = text.trim() ? getCompanyLogoUrl(text) : ''
      setCurrentLogo(generatedLogo)
      onChange(text, generatedLogo)
    }
  }

  const handleSelectBrand = (brand: CompanyBrand) => {
    setQuery(brand.name)
    setCurrentLogo(brand.logoUrl)
    setImgError(false)
    setIsOpen(false)
    onChange(brand.name, brand.logoUrl)
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        {/* Selected Logo Preview or Fallback Icon */}
        <div className="absolute left-3 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 shadow-2xs">
          {currentLogo && !imgError ? (
            <img
              src={currentLogo}
              alt={query}
              className="h-full w-full object-cover"
              onError={() => {
                // Fallback to Google favicon if Clearbit logo fails
                const domain = query.toLowerCase().replace(/[^\w]/g, '') + '.com'
                const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
                if (currentLogo !== googleFavicon) {
                  setCurrentLogo(googleFavicon)
                } else {
                  setImgError(true)
                }
              }}
            />
          ) : (
            <Building2 className="h-4 w-4 text-slate-400" />
          )}
        </div>

        <input
          type="text"
          required={required}
          value={query}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs transition-all"
        />
      </div>

      {/* Autocomplete Shrinking Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Renowned Brands ({results.length})</span>
            <span className="text-blue-600 font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Auto Logo
            </span>
          </div>

          {results.length > 0 ? (
            results.map((brand) => (
              <button
                key={brand.name}
                type="button"
                onClick={() => handleSelectBrand(brand)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 shadow-2xs group-hover:border-blue-300">
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-blue-700">
                      {brand.name}
                    </span>
                    <span className="ml-2 text-[10px] text-slate-400 font-medium">
                      ({brand.domain})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800">
                    {brand.industry}
                  </span>
                  {query.toLowerCase().trim() === brand.name.toLowerCase() && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-slate-500 text-center font-medium">
              Use custom company: <strong className="text-slate-800">&quot;{query}&quot;</strong> (Auto-generating logo)
            </div>
          )}
        </div>
      )}
    </div>
  )
}
