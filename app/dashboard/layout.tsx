import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Candidate Dashboard | Sophi Careers',
  description: 'Manage your job applications, saved jobs, and AI match recommendations.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
