import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://career.joinsophi.com'

  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/jobs`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/companies`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/recruiter`, priority: 0.7, changeFrequency: 'monthly' as const },
  ]

  let jobPages: any[] = [];
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, updated_at')
        .eq('status', 'active')

      if (jobs) {
        jobPages = jobs.map(job => ({
          url: `${baseUrl}/apply/${job.id}`,
          lastModified: new Date(job.updated_at || Date.now()),
          priority: 0.7,
          changeFrequency: 'weekly' as const
        }))
      }
    }
  } catch (err) {
    console.error("Failed to fetch jobs for sitemap", err);
  }

  return [...staticPages, ...jobPages]
}
