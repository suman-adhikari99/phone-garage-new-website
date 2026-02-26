import type { MarketingRecipientRecord } from "@/lib/booking-store"

export type SendBulkMarketingEmailInput = {
  subject: string
  offerTitle: string | null
  message: string
  recipients: MarketingRecipientRecord[]
}

export type SendBulkMarketingEmailResult =
  | {
      ok: true
      sentCount: number
      attemptedCount: number
      batchesSent: number
      messageIds: string[]
    }
  | {
      ok: false
      error: string
      retryable: boolean
      sentCount: number
      attemptedCount: number
    }

const RESEND_API_URL = "https://api.resend.com/emails"
const PHONE_GARAGE_LOGO_URL = "https://www.phonegarage.com.au/headerTop.png"

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function toParagraphsHtml(message: string) {
  return message
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p style=\"margin:0 0 14px 0;font-size:14px;line-height:1.7;color:#111827;\">${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("")
}

function extractEmail(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""

  const inBrackets = trimmed.match(/<([^>]+)>/)?.[1]?.trim() || ""
  if (inBrackets && isValidEmail(inBrackets)) return inBrackets

  return isValidEmail(trimmed) ? trimmed : ""
}

function normalizeSubject(value: string) {
  return value.trim().slice(0, 160)
}

function normalizeOfferTitle(value: string | null) {
  if (!value) return null
  const trimmed = value.trim().slice(0, 140)
  return trimmed || null
}

function normalizeMessage(value: string) {
  return value.trim().slice(0, 8000)
}

function getSafeBatchSize() {
  const parsed = Number(process.env.MARKETING_EMAIL_BATCH_SIZE)
  if (!Number.isFinite(parsed) || parsed <= 0) return 50
  return Math.max(1, Math.min(100, Math.floor(parsed)))
}

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim() || ""
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() || "Phone Garage <onboarding@resend.dev>"
  const ownerEmailRaw = process.env.SHOP_OWNER_EMAIL?.trim() || ""

  const firstOwnerEmail = ownerEmailRaw
    .split(",")
    .map((item) => item.trim())
    .find(Boolean)

  return {
    apiKey,
    fromEmail,
    fromAddress: extractEmail(fromEmail),
    replyTo: extractEmail(firstOwnerEmail || "") || extractEmail(fromEmail),
  }
}

function buildMarketingEmailHtml(subject: string, offerTitle: string | null, message: string) {
  const headline = offerTitle || subject

  return `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:24px;background:linear-gradient(140deg,#111827 0%,#1f2937 55%,#164e63 100%);color:#ffffff;">
                <img src="${PHONE_GARAGE_LOGO_URL}" alt="Phone Garage" style="height:38px;width:auto;display:block;" />
                <p style="margin:12px 0 0 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#bae6fd;">Phone Garage Marketing</p>
                <h1 style="margin:8px 0 0 0;font-size:26px;line-height:1.25;">${escapeHtml(headline)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 24px 24px 24px;">
                ${toParagraphsHtml(message)}
                <div style="margin-top:16px;border:1px solid #e5e7eb;border-radius:12px;padding:14px;background:#f9fafb;">
                  <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;">
                    Need help with your device? Reply to this email or call <strong>0403983009</strong>.
                  </p>
                </div>
                <p style="margin:14px 0 0 0;font-size:12px;color:#6b7280;line-height:1.5;">
                  You are receiving this because you previously contacted Phone Garage.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim()
}

function buildMarketingEmailText(subject: string, offerTitle: string | null, message: string) {
  const lines = [
    `Phone Garage Update${offerTitle?.trim() ? `: ${offerTitle.trim()}` : ""}`,
    `Subject: ${subject}`,
    "",
    message,
    "",
    "Need help with your device? Reply to this email or call 0403983009.",
    "",
    "You are receiving this because you previously contacted Phone Garage.",
  ]

  return lines.join("\n")
}

function splitIntoChunks<T>(items: T[], size: number) {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

function dedupeValidRecipientEmails(recipients: MarketingRecipientRecord[]) {
  const seen = new Set<string>()
  const uniqueEmails: string[] = []

  for (const recipient of recipients) {
    const email = recipient.email.trim()
    if (!isValidEmail(email)) continue

    const key = email.toLowerCase()
    if (seen.has(key)) continue

    seen.add(key)
    uniqueEmails.push(email)
  }

  return uniqueEmails
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isMarketingEmailConfigured() {
  const config = getEmailConfig()
  return Boolean(config.apiKey)
}

export async function sendBulkMarketingEmail(
  input: SendBulkMarketingEmailInput
): Promise<SendBulkMarketingEmailResult> {
  const config = getEmailConfig()
  if (!config.apiKey) {
    return {
      ok: false,
      error: "RESEND_API_KEY is missing.",
      retryable: true,
      sentCount: 0,
      attemptedCount: 0,
    }
  }

  const subject = normalizeSubject(input.subject)
  const offerTitle = normalizeOfferTitle(input.offerTitle)
  const message = normalizeMessage(input.message)

  if (!subject) {
    return {
      ok: false,
      error: "Email subject is required.",
      retryable: false,
      sentCount: 0,
      attemptedCount: 0,
    }
  }

  if (!message) {
    return {
      ok: false,
      error: "Email message is required.",
      retryable: false,
      sentCount: 0,
      attemptedCount: 0,
    }
  }

  const recipientEmails = dedupeValidRecipientEmails(input.recipients)
  if (recipientEmails.length === 0) {
    return {
      ok: false,
      error: "No valid customer emails available.",
      retryable: false,
      sentCount: 0,
      attemptedCount: 0,
    }
  }

  const fallbackTo = config.fromAddress || recipientEmails[0]
  if (!isValidEmail(fallbackTo)) {
    return {
      ok: false,
      error: "Could not determine a valid recipient target for this campaign.",
      retryable: false,
      sentCount: 0,
      attemptedCount: recipientEmails.length,
    }
  }

  const html = buildMarketingEmailHtml(subject, offerTitle, message)
  const text = buildMarketingEmailText(subject, offerTitle, message)
  const batchSize = getSafeBatchSize()
  const batches = splitIntoChunks(recipientEmails, batchSize)
  const campaignId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

  let sentCount = 0
  const messageIds: string[] = []

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index]

    const toAddress = config.fromAddress || batch[0]
    const bcc = config.fromAddress ? batch : batch.slice(1)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `marketing-${campaignId}-${index + 1}`,
        },
        body: JSON.stringify({
          from: config.fromEmail,
          to: [toAddress],
          ...(bcc.length > 0 ? { bcc } : {}),
          ...(config.replyTo ? { reply_to: config.replyTo } : {}),
          subject,
          html,
          text,
        }),
        signal: controller.signal,
      })

      const payload = (await response.json().catch(() => null)) as
        | { id?: string; message?: string; error?: { message?: string } }
        | null

      if (!response.ok) {
        const messageText =
          payload?.error?.message ||
          payload?.message ||
          `Resend API request failed with status ${response.status}.`

        return {
          ok: false,
          error: messageText,
          retryable: response.status >= 500 || response.status === 429,
          sentCount,
          attemptedCount: recipientEmails.length,
        }
      }

      if (payload?.id) {
        messageIds.push(payload.id)
      }

      sentCount += batch.length
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error while sending marketing campaign."

      return {
        ok: false,
        error: errorMessage,
        retryable: true,
        sentCount,
        attemptedCount: recipientEmails.length,
      }
    } finally {
      clearTimeout(timeoutId)
    }

    if (index < batches.length - 1) {
      await sleep(200)
    }
  }

  return {
    ok: true,
    sentCount,
    attemptedCount: recipientEmails.length,
    batchesSent: batches.length,
    messageIds,
  }
}
