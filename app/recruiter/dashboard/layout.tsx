import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recruiter Dashboard | Sophi Careers',
  description: 'Manage your job postings, candidate applications, and hiring pipeline.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
