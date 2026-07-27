export interface MatchResult {
  score: number | null
  matchedKeywords: string[]
  missingKeywords: string[]
  hasCv: boolean
}

export function extractCvKeywords(cvJob: any): string[] {
  if (!cvJob) return []

  const set = new Set<string>()

  // 1. Extract from gap_analysis
  if (cvJob.gap_analysis) {
    const ga = cvJob.gap_analysis
    if (Array.isArray(ga.matchingKeywords)) {
      ga.matchingKeywords.forEach((k: string) => set.add(k.toLowerCase().trim()))
    }
    if (Array.isArray(ga.missingKeywords)) {
      ga.missingKeywords.forEach((k: string) => set.add(k.toLowerCase().trim()))
    }
    if (Array.isArray(ga.suggestedAdditions)) {
      ga.suggestedAdditions.forEach((k: string) => set.add(k.toLowerCase().trim()))
    }
  }

  // 2. Extract from linkedin_optimizer
  if (cvJob.linkedin_optimizer) {
    const lo = cvJob.linkedin_optimizer
    if (Array.isArray(lo.skills)) {
      lo.skills.forEach((k: string) => set.add(k.toLowerCase().trim()))
    }
    if (typeof lo.headline === 'string') {
      lo.headline.toLowerCase().split(/[,\/\s]+/).forEach((w: string) => {
        if (w.length > 3) set.add(w.trim())
      })
    }
  }

  // 3. Extract from cv_data JSON structure
  if (cvJob.cv_data) {
    const cd = cvJob.cv_data
    if (Array.isArray(cd.skills)) {
      cd.skills.forEach((s: any) => {
        const name = typeof s === 'string' ? s : s.name || s.skill
        if (name && typeof name === 'string') set.add(name.toLowerCase().trim())
      })
    }
    if (Array.isArray(cd.experience)) {
      cd.experience.forEach((exp: any) => {
        if (exp.title) set.add(exp.title.toLowerCase().trim())
        if (exp.description) {
          exp.description.toLowerCase().split(/\s+/).forEach((w: string) => {
            if (w.length > 3) set.add(w.trim())
          })
        }
      })
    }
    if (cd.target_role) set.add(cd.target_role.toLowerCase().trim())
  }

  // 4. Raw text fallback
  if (cvJob.resume_text || cvJob.parsed_resume) {
    const raw = (cvJob.resume_text || JSON.stringify(cvJob.parsed_resume)).toLowerCase()
    raw.split(/[,\/\s\n]+/).forEach((w: string) => {
      if (w.length > 3) set.add(w.trim())
    })
  }

  return Array.from(set).filter((k) => k.length >= 2)
}

export function extractJobKeywords(job: any): string[] {
  if (!job) return []

  const set = new Set<string>()

  // 1. Explicit ATS keywords from Kimi AI
  if (Array.isArray(job.keywords)) {
    job.keywords.forEach((k: string) => set.add(k.toLowerCase().trim()))
  }

  // 2. Title & Department
  if (job.title) {
    job.title.toLowerCase().split(/[,\/\s]+/).forEach((w: string) => {
      if (w.length > 2 && !['senior', 'junior', 'lead', 'manager', 'executive', 'officer', 'associate'].includes(w)) {
        set.add(w.trim())
      }
    })
  }

  // 3. Requirements & Description text
  const reqText = `${job.requirements || ''} ${job.description || ''}`.toLowerCase()
  reqText.split(/[,\/\s\n•\-]+/).forEach((w: string) => {
    if (w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'only', 'will', 'your', 'their', 'must'].includes(w)) {
      set.add(w.trim())
    }
  })

  return Array.from(set).slice(0, 25)
}

export function calculateMatchScore(job: any, userCvJob: any): MatchResult {
  if (!userCvJob) {
    return {
      score: null,
      matchedKeywords: [],
      missingKeywords: extractJobKeywords(job),
      hasCv: false,
    }
  }

  const cvKws = extractCvKeywords(userCvJob)
  const jobKws = extractJobKeywords(job)

  if (jobKws.length === 0 || cvKws.length === 0) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: jobKws,
      hasCv: true,
    }
  }

  // Find matching & missing keywords
  const matched = jobKws.filter((jk) =>
    cvKws.some((ck) => ck === jk || ck.includes(jk) || jk.includes(ck))
  )

  const missing = jobKws.filter(
    (jk) => !cvKws.some((ck) => ck === jk || ck.includes(jk) || jk.includes(ck))
  )

  let score = Math.round((matched.length / Math.max(jobKws.length, 1)) * 100)

  // Title relevance bonus
  if (job.title && userCvJob) {
    const jobTitleLower = job.title.toLowerCase()
    const cvText = JSON.stringify(userCvJob).toLowerCase()
    if (cvText.includes(jobTitleLower)) {
      score = Math.min(100, score + 20)
    }
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    matchedKeywords: Array.from(new Set(matched)),
    missingKeywords: Array.from(new Set(missing)),
    hasCv: true,
  }
}
