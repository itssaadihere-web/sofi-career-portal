'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    adsbygoogle?: any[]
  }
}

interface GoogleAdProps {
  adSlot?: string
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
  fullWidthResponsive?: boolean
  className?: string
  style?: React.CSSProperties
  label?: string
  variant?: 'banner' | 'infeed' | 'rectangle' | 'leaderboard' | 'sidebar'
}

export default function GoogleAd({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style,
  label = 'Sponsored',
  variant = 'banner',
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null)
  const [adLoaded, setAdLoaded] = useState(false)
  const adSenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID

  const slotId = adSlot || process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_DEFAULT

  useEffect(() => {
    // Only attempt pushing if Google AdSense client ID is set and window.adsbygoogle is ready
    if (!adSenseClient) return

    try {
      if (typeof window !== 'undefined') {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        setAdLoaded(true)
      }
    } catch (err) {
      console.warn('Google AdSense push error:', err)
    }
  }, [adSenseClient, slotId])

  // Responsive container styles depending on variant
  const variantContainerClasses = {
    leaderboard: 'w-full min-h-[90px] max-h-[120px]',
    banner: 'w-full min-h-[100px]',
    infeed: 'w-full min-h-[120px] my-4',
    rectangle: 'w-full min-h-[250px]',
    sidebar: 'w-full min-h-[300px]',
  }[variant]

  // If no AdSense publisher ID is provided in environment variables,
  // render an elegant, accessible placeholder UI so page layouts stay pixel-perfect.
  if (!adSenseClient) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-dashed border-slate-200 bg-gradient-to-r from-slate-50 via-emerald-50/20 to-slate-50 p-4 text-center text-slate-400 transition-all hover:border-emerald-200 ${variantContainerClasses} ${className}`}
        style={style}
      >
        <div className="flex h-full min-h-[90px] flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
            {label}
          </div>
          <p className="text-xs font-medium text-slate-500">
            Google Ad Unit Placement ({variant})
          </p>
          <p className="text-[11px] text-slate-400">
            Set <code className="rounded bg-slate-200/60 px-1 py-0.5 font-mono text-[10px] text-slate-600">NEXT_PUBLIC_GOOGLE_ADSENSE_ID</code> to enable live ads
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${variantContainerClasses} ${className}`} style={style}>
      {label && (
        <div className="mb-1 text-right text-[10px] font-medium tracking-wider text-slate-400 uppercase">
          {label}
        </div>
      )}
      <ins
        ref={adRef}
        className="adsbygoogle block w-full"
        data-ad-client={adSenseClient}
        data-ad-slot={slotId || '1234567890'}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        style={{ display: 'block', ...style }}
      />
    </div>
  )
}
