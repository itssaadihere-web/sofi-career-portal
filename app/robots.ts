import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/recruiter/dashboard/',
          '/recruiter/post-job/',
          '/auth/',
          '/apply/',
          '/api/',
        ]
      },
      {
        userAgent: 'GPTBot',
        allow: '/'
      },
      {
        userAgent: 'Google-Extended',
        allow: '/'
      }
    ],
    sitemap: 'https://career.joinsophi.com/sitemap.xml',
    host: 'https://career.joinsophi.com'
  }
}
