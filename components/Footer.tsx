import Link from 'next/link'

export default function Footer() {
  const CV_BUILDER_URL = process.env.NEXT_PUBLIC_CV_BUILDER_URL || 'https://joinsophi.com'

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-lg">
                S
              </div>
              <span className="font-extrabold text-slate-900 text-lg">
                Sophi<span className="text-blue-600">Careers</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI-powered career platform connecting ATS-optimized candidates with leading employers across Pakistan and Gulf.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Job Seekers</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/jobs" className="hover:text-blue-600">Browse All Jobs</Link></li>
              <li><a href={CV_BUILDER_URL} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">AI CV Builder</a></li>
              <li><Link href="/dashboard" className="hover:text-blue-600">My Applications</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Employers</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/recruiter" className="hover:text-blue-600">Post a Job</Link></li>
              <li><Link href="/recruiter/dashboard" className="hover:text-blue-600">Recruiter Dashboard</Link></li>
              <li><Link href="/companies" className="hover:text-blue-600">Employer Directory</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href={`${CV_BUILDER_URL}/privacy-policy`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Privacy Policy</a></li>
              <li><a href={`${CV_BUILDER_URL}/terms-and-conditions`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Terms of Service</a></li>
              <li><span className="text-slate-400">Support: support@joinsophi.com</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Sophi Platform. All rights reserved. Powered by AI CV Matching.
        </div>
      </div>
    </footer>
  )
}
