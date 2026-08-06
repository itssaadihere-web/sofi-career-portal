import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Top Hiring Companies in Pakistan & Gulf | Sophi Careers',
  description: 'Discover leading companies hiring tech, finance, engineering, and marketing talent in Pakistan. Connect with verified recruiters.',
  alternates: { canonical: 'https://career.joinsophi.com/companies' },
  openGraph: {
    title: 'Top Hiring Companies in Pakistan & Gulf | Sophi Careers',
    description: 'Discover leading companies hiring tech, finance, engineering, and marketing talent in Pakistan. Connect with verified recruiters.',
    url: 'https://career.joinsophi.com/companies',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
