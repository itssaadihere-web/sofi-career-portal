import Link from 'next/link'
import { CheckCircle2, Building2, Sparkles, Zap, ShieldCheck, Gift, Infinity as InfinityIcon } from 'lucide-react'

export default function RecruiterLandingPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Recruiter Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-blue-950 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-4 py-1.5 text-xs font-bold text-emerald-200">
            <Gift className="h-4 w-4 text-emerald-400" />
            <span>100% FREE FOR ALL EMPLOYERS & AGENCIES</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Hire Faster — Post <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Unlimited Jobs 100% Free
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-medium">
            Sophi Careers connects employers & recruitment agencies with ATS-optimized candidates. Zero fees, zero hidden limits — post as many jobs as you need.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/recruiter/post-job"
              className="px-8 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-sm hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
            >
              <InfinityIcon className="h-5 w-5" />
              <span>Post Unlimited Jobs Free →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Step Process */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900">How It Works for Employers & Agencies</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Streamlined hiring with AI assistance in 3 intuitive steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg">1</div>
            <h3 className="font-bold text-slate-900 text-lg">Create Free Recruiter Profile</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Set up your employer or agency brand profile with auto-selected brand logos and verified status.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg">2</div>
            <h3 className="font-bold text-slate-900 text-lg">LinkedIn URL or Voice/Chat Post</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Paste any LinkedIn job URL or talk to Sophi AI via Voice/Chat to automatically build & publish your job listing.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg">3</div>
            <h3 className="font-bold text-slate-900 text-lg">Review Ranked Candidates</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Every applicant comes with an instant AI keyword match score (0-100%). Review candidates with zero restriction.
            </p>
          </div>
        </div>
      </section>

      {/* Free Forever Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-blue-700 p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Completely Free Platform
            </span>
            <h2 className="text-3xl font-black">Zero Fees for Employers & Agencies</h2>
            <p className="text-sm text-emerald-50 leading-relaxed font-medium">
              No credit limits, no subscription plans, and no payment required. Post as many job listings as your team needs with full access to Sophi AI features.
            </p>
          </div>

          <Link
            href="/recruiter/post-job"
            className="shrink-0 px-8 py-4 rounded-2xl bg-white text-slate-900 font-extrabold text-sm hover:bg-slate-100 transition-all shadow-xl"
          >
            Start Posting Free Now →
          </Link>
        </div>
      </section>
    </div>
  )
}
