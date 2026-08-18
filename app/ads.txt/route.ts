import { NextResponse } from 'next/server'

export async function GET() {
  const adSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || 'ca-pub-7315986629947930'
  const pubId = adSenseId.startsWith('ca-pub-')
    ? adSenseId.replace('ca-', '')
    : adSenseId.startsWith('pub-')
    ? adSenseId
    : `pub-${adSenseId}`

  const content = `# Google AdSense ads.txt for Sophi Careers
google.com, ${pubId}, DIRECT, f08c47fec0942fa0
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
