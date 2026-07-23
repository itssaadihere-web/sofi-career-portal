import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export interface ErrorReportParams {
  errorMessage: string
  errorStack?: string
  url?: string
  userId?: string
  userEmail?: string
  userAgent?: string
  additionalContext?: Record<string, any>
}

/**
 * Generates automated heuristic diagnostic and possible solution based on error string
 */
function analyzePossibleSolution(message: string, stack?: string): string {
  const errLower = (message + ' ' + (stack || '')).toLowerCase()

  if (errLower.includes('supabase') || errLower.includes('postgrest') || errLower.includes('pgrst')) {
    return 'Database query failure. Check Supabase RLS policies, table schema column types, or database connection credentials.'
  }
  if (errLower.includes('resend') || errLower.includes('api key') || errLower.includes('unauthorized')) {
    return 'API Authentication failure. Verify API keys in environment variables (RESEND_API_KEY, KIMI_API_KEY, etc.).'
  }
  if (errLower.includes('fetch') || errLower.includes('network') || errLower.includes('timeout')) {
    return 'Network / External API communication timeout. Check external service availability or network configuration.'
  }
  if (errLower.includes('typeerror') || errLower.includes('undefined') || errLower.includes('null')) {
    return 'Null pointer or variable type mismatch. Verify data payload structure and handle optional dereferencing (?.) safely.'
  }
  if (errLower.includes('json') || errLower.includes('syntaxerror')) {
    return 'Invalid JSON parsing payload. Inspect API response payload formatting.'
  }
  return 'General system runtime exception. Review the attached stack trace, check server/client logs, and verify environment configuration.'
}

export async function sendSystemErrorReport(params: ErrorReportParams) {
  const timestamp = new Date().toISOString()
  const formattedDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }) + ' (PKT)'
  const possibleSolution = analyzePossibleSolution(params.errorMessage, params.errorStack)

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fb; color: #1f2937; padding: 20px; }
        .container { max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #0f2b48; color: #ffffff; padding: 18px 24px; border-radius: 12px; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; display: flex; align-items: center; justify-content: space-between; }
        .badge { background: #c5a059; color: #0f2b48; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
        .section { margin-top: 24px; }
        .label { font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .value { font-size: 14px; font-weight: 600; color: #111827; background: #f9fafb; border: 1px solid #f3f4f6; padding: 10px 14px; border-radius: 8px; word-break: break-word; }
        .error-box { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 14px; border-radius: 10px; font-size: 14px; font-weight: 700; font-family: monospace; }
        .stack-box { background: #111827; color: #38bdf8; padding: 16px; border-radius: 10px; font-size: 12px; font-family: 'Courier New', Courier, monospace; overflow-x: auto; white-space: pre-wrap; line-height: 1.5; }
        .solution-box { background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 16px; border-radius: 10px; font-size: 13px; font-weight: 600; line-height: 1.6; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af; border-t: 1px solid #f3f4f6; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span>SYSTEM ERROR MESSAGE</span>
          <span class="badge">URGENT REPORT</span>
        </div>

        <div class="section">
          <div class="label">Point of Time</div>
          <div class="value">${formattedDate} &nbsp;|&nbsp; <code>${timestamp}</code></div>
        </div>

        <div class="section">
          <div class="label">Location / Target URL</div>
          <div class="value"><code>${params.url || 'Server-side API / Background Task'}</code></div>
        </div>

        ${params.userEmail || params.userId ? `
        <div class="section">
          <div class="label">User Context</div>
          <div class="value">Email: <b>${params.userEmail || 'N/A'}</b> &nbsp;|&nbsp; User ID: <code>${params.userId || 'N/A'}</code></div>
        </div>
        ` : ''}

        ${params.userAgent ? `
        <div class="section">
          <div class="label">User Agent / Client Browser</div>
          <div class="value"><code>${params.userAgent}</code></div>
        </div>
        ` : ''}

        <div class="section">
          <div class="label">Error Message</div>
          <div class="error-box">${params.errorMessage}</div>
        </div>

        ${params.errorStack ? `
        <div class="section">
          <div class="label">Full Stack Trace</div>
          <div class="stack-box">${params.errorStack}</div>
        </div>
        ` : ''}

        <div class="section">
          <div class="label">Automated Diagnostic & Possible Solution</div>
          <div class="solution-box">
            💡 <b>Recommended Action:</b> ${possibleSolution}
          </div>
        </div>

        ${params.additionalContext ? `
        <div class="section">
          <div class="label">Additional Payload Context</div>
          <div class="value"><code>${JSON.stringify(params.additionalContext, null, 2)}</code></div>
        </div>
        ` : ''}

        <div class="footer">
          Automated System Error Dispatcher &bull; Sophi Platform Monitor
        </div>
      </div>
    </body>
    </html>
  `

  console.error('[SYSTEM ERROR REPORT DISPATCHED]', {
    heading: 'SYSTEM ERROR MESSAGE',
    timestamp,
    url: params.url,
    error: params.errorMessage
  })

  if (resend) {
    try {
      await resend.emails.send({
        from: 'Sophi Monitor <noreply@joinsophi.com>',
        to: 'support@joinsophi.com',
        subject: `SYSTEM ERROR MESSAGE — ${params.errorMessage.slice(0, 60)}`,
        html: htmlContent
      })
    } catch (sendErr) {
      console.error('Failed to send error email report via Resend:', sendErr)
    }
  }
}
