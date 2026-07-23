import Link from 'next/link'
import { CheckCircle2, Building2, Sparkles, Zap, ShieldCheck } from 'lucide-react'

export default function RecruiterLandingPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Recruiter Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-blue-950 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 text-xs font-bold text-blue-200">
            <Building2 className="h-4 w-4 text-blue-400" />
            <span>FOR EMPLOYERS & HIRING MANAGERS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Hire Faster — Reach <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              ATS-Optimized Talent
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-medium">
            Sophi Careers connects you with candidates who have already benchmarked and optimized their CVs. See real AI match scores before you shortlist.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/recruiter/post-job"
              className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-extrabold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30"
            >
              Post a Job Free (2 Credits) →
            </Link>
            <a
              href="#pricing"
              className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all"
            >
              View Employer Pricing
            </a>
          </div>
        </div>
      </section>

      {/* 3 Step Process */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900">How It Works for Recruiters</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Streamlined hiring in 3 intuitive steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg">1</div>
            <h3 className="font-bold text-slate-900 text-lg">Create Company Profile</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Set up your employer brand profile with logo, description, location, and verified status.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg">2</div>
            <h3 className="font-bold text-slate-900 text-lg">Post Job Listing</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Publish job details. Our Kimi AI engine automatically extracts top 15 ATS keywords from your job description.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg">3</div>
            <h3 className="font-bold text-slate-900 text-lg">Review Ranked Candidates</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Every applicant comes with an instant AI keyword match score (0-100%). Interview your highest matches first.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Simple, Transparent Pricing</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Choose the plan that matches your hiring velocity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase text-slate-400">Free Tier</span>
              <h3 className="text-2xl font-black text-slate-900">Free Plan</h3>
              <div className="text-3xl font-black text-slate-900">FREE</div>
              <ul className="space-y-3 text-xs font-medium text-slate-600 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ 2 Free Job Posts</li>
                <li className="flex items-center gap-2">✓ Basic Candidate Analytics</li>
                <li className="flex items-center gap-2">✓ Email Notifications</li>
                <li className="flex items-center gap-2">✓ 30-Day Listing Duration</li>
              </ul>
            </div>
            <Link
              href="/recruiter/post-job"
              className="w-full text-center py-3 rounded-xl bg-slate-100 text-slate-900 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Starter Plan */}
          <div className="rounded-3xl border-2 border-blue-600 bg-white p-8 shadow-xl relative flex flex-col justify-between space-y-6">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase text-blue-600">Growth</span>
              <h3 className="text-2xl font-black text-slate-900">Starter Plan</h3>
              <div className="text-3xl font-black text-slate-900">4,999 <span className="text-xs text-slate-500 font-medium">PKR / mo</span></div>
              <ul className="space-y-3 text-xs font-medium text-slate-600 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ 10 Job Posts / Month</li>
                <li className="flex items-center gap-2">✓ Application Management Pipeline</li>
                <li className="flex items-center gap-2">✓ Featured Listing Badge</li>
                <li className="flex items-center gap-2">✓ Verified Company Profile</li>
              </ul>
            </div>
            <Link
              href="/recruiter/post-job"
              className="w-full text-center py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md"
            >
              Choose Starter
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase text-slate-400">Enterprise</span>
              <h3 className="text-2xl font-black text-slate-900">Pro Plan</h3>
              <div className="text-3xl font-black text-slate-900">14,999 <span className="text-xs text-slate-500 font-medium">PKR / mo</span></div>
              <ul className="space-y-3 text-xs font-medium text-slate-600 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ Unlimited Job Posts</li>
                <li className="flex items-center gap-2">✓ Priority Search Placement</li>
                <li className="flex items-center gap-2">✓ ATS Keyword Insights</li>
                <li className="flex items-center gap-2">✓ Dedicated Account Manager</li>
              </ul>
            </div>
            <Link
              href="/recruiter/post-job"
              className="w-full text-center py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Contact Sales / Buy Pro
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
