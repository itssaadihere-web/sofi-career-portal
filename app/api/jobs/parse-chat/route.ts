import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, currentJobData } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const kimiKey = process.env.KIMI_API_KEY
    const kimiBase = process.env.KIMI_API_BASE || 'https://api.moonshot.ai/v1'

    let reply = ''
    let extractedFields: Record<string, any> = {}

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
                content: `You are Sophi, an expert AI recruitment assistant helping recruiters write and refine job postings in real time.
Your name is "Sophi". Always address the user warmly, professionally, and concisely.

Given the recruiter's prompt or voice transcript AND their current job form state, you must:
1. Provide a short, friendly, helpful reply (1-3 sentences) acknowledging what you did or updated.
2. Extract or update any relevant job posting fields based on the message.

Return ONLY a raw JSON object (no markdown, no backticks) with this structure:
{
  "reply": "Hey! I've updated the job title to Senior React Developer and set the salary to PKR 200k - 350k per month.",
  "extractedFields": {
    "title": "optional updated title",
    "department": "optional updated department",
    "industry": "optional updated industry",
    "locationCity": "one of: Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar, Remote",
    "locationType": "one of: onsite, remote, hybrid",
    "employmentType": "one of: full-time, part-time, contract, internship",
    "experienceLevel": "one of: entry, mid, senior, lead",
    "experienceMin": number,
    "experienceMax": number,
    "salaryMin": number,
    "salaryMax": number,
    "description": "optional updated full description",
    "requirements": "optional updated requirements list",
    "responsibilities": "optional updated responsibilities list",
    "benefits": "optional updated benefits list"
  }
}
Only include fields in "extractedFields" that were mentioned or implied in the recruiter's message.`,
              },
              {
                role: 'user',
                content: `Current Job Form State: ${JSON.stringify(currentJobData || {})}\n\nRecruiter Voice/Text Input: "${message}"`,
              },
            ],
            temperature: 0.2,
          }),
        })

        if (aiRes.ok) {
          const data = await aiRes.json()
          const rawContent = data.choices?.[0]?.message?.content || ''
          const match = rawContent.match(/\{[\s\S]*\}/)
          if (match) {
            const parsed = JSON.parse(match[0])
            reply = parsed.reply || "I've processed your instructions and updated the job form!"
            extractedFields = parsed.extractedFields || {}
          }
        }
      } catch (err) {
        console.error('Sophi Chat AI call error:', err)
      }
    }

    // Fallback if AI call failed or key is missing
    if (!reply) {
      const lower = message.toLowerCase()

      // Basic regex extraction fallback for common commands
      if (lower.includes('title') || lower.includes('developer') || lower.includes('engineer') || lower.includes('manager')) {
        const titleWords = message.split('for').pop()?.trim() || message.split('a').pop()?.trim() || message
        extractedFields.title = titleWords.length < 50 ? titleWords : 'Senior Software Engineer'
      }

      if (lower.includes('karachi')) extractedFields.locationCity = 'Karachi'
      if (lower.includes('lahore')) extractedFields.locationCity = 'Lahore'
      if (lower.includes('islamabad')) extractedFields.locationCity = 'Islamabad'
      if (lower.includes('remote')) extractedFields.locationType = 'remote'
      if (lower.includes('hybrid')) extractedFields.locationType = 'hybrid'
      if (lower.includes('onsite')) extractedFields.locationType = 'onsite'

      if (lower.includes('salary') || lower.includes('pkr') || lower.includes('k')) {
        const numbers = message.match(/\d+/g)
        if (numbers && numbers.length >= 2) {
          let num1 = parseInt(numbers[0])
          let num2 = parseInt(numbers[1])
          if (num1 < 1000) num1 *= 1000
          if (num2 < 1000) num2 *= 1000
          extractedFields.salaryMin = Math.min(num1, num2)
          extractedFields.salaryMax = Math.max(num1, num2)
        }
      }

      reply = `Hi! I'm Sophi. I've noted your input ("${message}") and auto-updated the matching job fields in your post!`
    }

    return NextResponse.json({
      success: true,
      reply,
      extractedFields,
    })
  } catch (err: any) {
    console.error('Sophi Chat API error:', err)
    return NextResponse.json({ error: err.message || 'Failed to process Sophi AI chat' }, { status: 500 })
  }
}
