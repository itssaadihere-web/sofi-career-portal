import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Verified Jobs in Pakistan & Gulf | Sophi Careers',
  description: 'Explore 500+ active job openings matched to your Sophi CV profile. Filter by city, industry, salary, and work mode.',
  alternates: { canonical: 'https://career.joinsophi.com/jobs' },
  openGraph: {
    title: 'Browse Verified Jobs in Pakistan & Gulf | Sophi Careers',
    description: 'Explore 500+ active job openings matched to your Sophi CV profile. Filter by city, industry, salary, and work mode.',
    url: 'https://career.joinsophi.com/jobs',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
