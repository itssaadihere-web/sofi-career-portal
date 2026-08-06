import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In to Sophi Careers',
  description: 'Sign in to access AI-matched job recommendations, save jobs, and track applications.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
