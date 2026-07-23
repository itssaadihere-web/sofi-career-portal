import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://career.joinsophi.com'),
  title: {
    default: 'Sophi Careers — AI-Matched Jobs for Pakistani Professionals',
    template: '%s | Sophi Careers'
  },
  description: 'Find jobs that match your Sophi CV. AI-powered job matching for Pakistani professionals. Browse 500+ active jobs across Pakistan and Gulf.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" />
        <div className="flex min-h-screen flex-col justify-between">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
