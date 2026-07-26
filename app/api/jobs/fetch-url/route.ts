import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Standard URL validation
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format provided' }, { status: 400 })
    }

    // Fetch page HTML with standard browser user-agent
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Could not fetch job post. HTTP status ${response.status}` },
        { status: 400 }
      )
    }

    const html = await response.text()

    // 1. Extract JSON-LD (Schema.org JobPosting if present)
    let jsonLdData: any = null
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)
    if (jsonLdMatches) {
      for (const m of jsonLdMatches) {
        try {
          const content = m.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '').trim()
          const parsed = JSON.parse(content)
          if (parsed['@type'] === 'JobPosting' || (Array.isArray(parsed['@graph']) && parsed['@graph'].some((item: any) => item['@type'] === 'JobPosting'))) {
            jsonLdData = parsed['@type'] === 'JobPosting' ? parsed : parsed['@graph'].find((item: any) => item['@type'] === 'JobPosting')
            break
          }
        } catch {
          // ignore parse errors
        }
      }
    }

    // 2. Extract OpenGraph & Meta Tags
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i)?.[1] || ''
    const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i)?.[1] || ''
    const pageTitle = html.match(/<title>([^<]*)<\/title>/i)?.[1] || ''
    const metaDesc = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || ''

    // 3. Clean body text extraction
    let cleanText = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Truncate to safe length for AI context
    cleanText = cleanText.slice(0, 12000)

    const fullScrapedPayload = `
    Job URL: ${url}
    Page Title: ${pageTitle}
    OG Title: ${ogTitle}
    OG Description: ${ogDescription}
    Meta Description: ${metaDesc}
    JSON-LD Schema Data: ${jsonLdData ? JSON.stringify(jsonLdData) : 'N/A'}
    Page Main Content: ${cleanText}
    `

    // Extract structured job fields using Kimi AI or Smart Fallback
    let structuredJob: any = {}
    const kimiKey = process.env.KIMI_API_KEY
    const kimiBase = process.env.KIMI_API_BASE || 'https://api.moonshot.ai/v1'

    if (kimiKey) {
      try {
        const aiRes = await fetch(`${kimiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${kimiKey}`,
          },
          body: JSON.stringify({
            model: 'moonshot-v1-8k',
            messages: [
              {
                role: 'system',
                content: `You are Sophi's LinkedIn & Job Post Extraction AI. Extract ALL comprehensive job details from the provided scraped web content of a LinkedIn or external job posting.
Return ONLY a raw JSON object (no markdown, no triple backticks) matching this exact schema:
{
  "title": "exact job title string",
  "department": "department or team name if mentioned, else Engineering/Product/etc",
  "industry": "one of: Technology & IT, Finance & Banking, Marketing & Sales, Engineering, Healthcare",
  "locationCity": "one of: Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar, Remote",
  "locationType": "one of: onsite, remote, hybrid",
  "employmentType": "one of: full-time, part-time, contract, internship",
  "experienceLevel": "one of: entry, mid, senior, lead",
  "experienceMin": number (e.g. 1, 3, 5),
  "experienceMax": number (e.g. 3, 5, 8),
  "salaryMin": number (PKR monthly or estimated standard e.g. 150000),
  "salaryMax": number (PKR monthly or estimated standard e.g. 300000),
  "description": "comprehensive detailed description of the role",
  "requirements": "bulleted list of key technical skills, requirements, & qualifications",
  "responsibilities": "bulleted list of key duties & responsibilities",
  "benefits": "bulleted list of perks and benefits if mentioned"
}`,
              },
              {
                role: 'user',
                content: `Extract complete job details from this scraped LinkedIn post data:\n${fullScrapedPayload}`,
              },
            ],
            temperature: 0.1,
          }),
        })

        if (aiRes.ok) {
          const aiData = await aiRes.json()
          const rawContent = aiData.choices?.[0]?.message?.content || ''
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            structuredJob = JSON.parse(jsonMatch[0])
          }
        }
      } catch (err) {
        console.error('AI URL Parsing failed, using fallback parsing:', err)
      }
    }

    // Fallback parser if AI key not present or call failed
    if (!structuredJob.title) {
      const extractedTitle = ogTitle.split('|')[0]?.split('-')[0]?.trim() || pageTitle.split('|')[0]?.split('-')[0]?.trim() || 'Software Engineer'
      structuredJob = {
        title: extractedTitle,
        department: 'Technology & IT',
        industry: 'Technology & IT',
        locationCity: html.toLowerCase().includes('lahore') ? 'Lahore' : html.toLowerCase().includes('islamabad') ? 'Islamabad' : 'Karachi',
        locationType: html.toLowerCase().includes('remote') ? 'remote' : html.toLowerCase().includes('hybrid') ? 'hybrid' : 'onsite',
        employmentType: html.toLowerCase().includes('contract') ? 'contract' : html.toLowerCase().includes('part-time') ? 'part-time' : 'full-time',
        experienceLevel: html.toLowerCase().includes('senior') || html.toLowerCase().includes('lead') ? 'senior' : 'mid',
        experienceMin: 2,
        experienceMax: 5,
        salaryMin: 150000,
        salaryMax: 250000,
        description: ogDescription || metaDesc || cleanText.slice(0, 1000),
        requirements: `• Experience with core requirements mentioned in job post\n• Proven track record in professional environment`,
        responsibilities: `• Deliver key responsibilities as outlined in LinkedIn job posting`,
        benefits: `• Competitive market compensation\n• Flexible work environment`
      }
    }

    return NextResponse.json({
      success: true,
      data: structuredJob,
      sourceUrl: url,
    })
  } catch (err: any) {
    console.error('Fetch URL route error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to fetch and parse job URL' },
      { status: 500 }
    )
  }
}
