import React from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number | string
  height?: number | string
  showTagline?: boolean
  light?: boolean
}

export default function Logo({
  className = '',
  width = 140,
  height = 140,
  showTagline = true,
  light = false
}: LogoProps) {
  const w = typeof width === 'number' ? width : parseInt(width as string) || 140
  const h = typeof height === 'number' ? height : parseInt(height as string) || 140

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Image
        src="/images/logo.svg"
        alt="Sophi Logo"
        width={w}
        height={h}
        priority
        className="shrink-0 object-contain"
      />
    </div>
  )
}
