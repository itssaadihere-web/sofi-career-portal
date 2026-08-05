/**
 * Utility to format job publication timestamps into rounded hours/days time-ago strings.
 * e.g. "1 hour ago", "3 hours ago", "18 hours ago", "1 day ago", "3 days ago"
 */
export function formatTimeAgo(publishedAt?: string): string {
  if (!publishedAt) return 'Posted recently'

  const date = new Date(publishedAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (isNaN(diffMs) || diffMs < 0) return 'Posted today'

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Rounded to hours as requested (no minutes)
  if (diffHours < 1) {
    return '1 hour ago'
  }

  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  }

  if (diffDays === 1) {
    return '1 day ago'
  }

  if (diffDays < 30) {
    return `${diffDays} days ago`
  }

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return '1 month ago'
  if (diffMonths < 12) return `${diffMonths} months ago`

  return `${diffDays} days ago`
}
