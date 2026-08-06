import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Employer Portal & Job Posting | Sophi Careers',
  description: 'Post jobs, reach pre-vetted ATS-optimized candidates, and streamline recruitment across Pakistan and Gulf.',
  alternates: { canonical: 'https://career.joinsophi.com/recruiter' },
  openGraph: {
    title: 'Employer Portal & Job Posting | Sophi Careers',
    description: 'Post jobs, reach pre-vetted ATS-optimized candidates, and streamline recruitment across Pakistan and Gulf.',
    url: 'https://career.joinsophi.com/recruiter',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
