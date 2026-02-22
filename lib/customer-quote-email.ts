import type { RepairBookingRecord } from "@/lib/booking-store"

export type CustomerQuoteEmailInput = {
  booking: RepairBookingRecord
  quoteAmount: string
  quoteEta: string | null
  quoteMessage: string | null
  services: string[]
  validUntil: Date
}

export type CustomerQuoteEmailResult =
  | { ok: true; messageId: string | null }
  | { ok: false; error: string; retryable: boolean }

const RESEND_API_URL = "https://api.resend.com/emails"
const QUOTE_LOGO_URL = "https://www.phonegarage.com.au/headerTop.png"

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

function safeText(value: string | null | undefined, fallback = "Not provided") {
  const normalized = value?.trim()
  return normalized ? escapeHtml(normalized) : fallback
}

function toDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(date)
}

function extractEmail(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""

  const inBrackets = trimmed.match(/<([^>]+)>/)?.[1]?.trim() || ""
  if (inBrackets && isValidEmail(inBrackets)) return inBrackets
  return isValidEmail(trimmed) ? trimmed : ""
}

function formatQuoteAmount(value: string) {
  const normalized = value.replace(/[^\d.]/g, "")
  const numeric = Number(normalized)

  if (Number.isFinite(numeric) && numeric >= 0) {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 2,
    }).format(numeric)
  }

  return value.trim() || "TBC"
}

function listItemsHtml(services: string[]) {
  const cleaned = services.map((item) => item.trim()).filter(Boolean)
  if (cleaned.length === 0) {
    return `<li style="margin:0 0 8px 0;">General repair service</li>`
  }

  return cleaned
    .map(
      (service) =>
        `<li style="margin:0 0 8px 0;">${escapeHtml(service)}</li>`
    )
    .join("")
}

function buildQuoteEmailHtml(input: CustomerQuoteEmailInput) {
  const { booking, quoteAmount, quoteEta, quoteMessage, services, validUntil } = input
  const issuedDate = new Date()
  const formattedAmount = formatQuoteAmount(quoteAmount)
  const quotedMessage = quoteMessage?.trim()
    ? escapeHtml(quoteMessage.trim()).replaceAll("\n", "<br />")
    : "Thank you for choosing Phone Garage. We are ready to proceed as soon as you confirm."

  return `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:700px;border-radius:18px;overflow:hidden;background:#ffffff;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:24px;background:linear-gradient(140deg,#0f172a 0%,#111827 55%,#064e3b 100%);color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:top;">
                      <img src="${QUOTE_LOGO_URL}" alt="Phone Garage" style="height:40px;width:auto;display:block;" />
                      <p style="margin:10px 0 0 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#a7f3d0;">Professional Repair Quote</p>
                      <h1 style="margin:8px 0 0 0;font-size:26px;line-height:1.2;">Quote for Your Device Repair</h1>
                    </td>
                    <td align="right" style="vertical-align:top;">
                      <p style="margin:0;font-size:12px;color:#d1d5db;">Reference</p>
                      <p style="margin:4px 0 0 0;font-size:14px;font-weight:700;">${escapeHtml(booking.bookingRef)}</p>
                      <p style="margin:14px 0 0 0;font-size:12px;color:#d1d5db;">Issued</p>
                      <p style="margin:4px 0 0 0;font-size:13px;">${escapeHtml(toDisplayDate(issuedDate))}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 24px 24px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
                  <tr>
                    <td style="padding:0 8px 0 0;vertical-align:top;">
                      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;height:100%;">
                        <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Billed To</p>
                        <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">${safeText(booking.customerName)}</p>
                        <p style="margin:6px 0 0 0;font-size:13px;color:#374151;">${safeText(booking.customerEmail)}</p>
                        <p style="margin:4px 0 0 0;font-size:13px;color:#374151;">${safeText(booking.customerPhone)}</p>
                      </div>
                    </td>
                    <td style="padding:0 0 0 8px;vertical-align:top;">
                      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;height:100%;background:#f9fafb;">
                        <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Quote Summary</p>
                        <p style="margin:0;font-size:13px;color:#111827;"><strong>Device:</strong> ${safeText(booking.brandName)} ${safeText(booking.modelName, "")}</p>
                        <p style="margin:6px 0 0 0;font-size:13px;color:#111827;"><strong>Turnaround:</strong> ${safeText(quoteEta, "Quoted after inspection")}</p>
                        <p style="margin:6px 0 0 0;font-size:13px;color:#111827;"><strong>Valid Until:</strong> ${escapeHtml(toDisplayDate(validUntil))}</p>
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:16px;">
                  <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Included Services</p>
                  <ul style="margin:0;padding:0 0 0 18px;font-size:13px;line-height:1.5;color:#111827;">
                    ${listItemsHtml(services)}
                  </ul>
                </div>

                <div style="border-radius:14px;padding:16px;background:linear-gradient(140deg,#ecfeff 0%,#ecfdf3 100%);border:1px solid #a7f3d0;margin-bottom:16px;">
                  <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#065f46;">Total Quote (AUD)</p>
                  <p style="margin:8px 0 0 0;font-size:34px;line-height:1;font-weight:800;color:#064e3b;">${escapeHtml(formattedAmount)}</p>
                </div>

                <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;">
                  <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Message from Technician</p>
                  <p style="margin:0;font-size:13px;line-height:1.6;color:#111827;">${quotedMessage}</p>
                </div>

                <p style="margin:14px 0 0 0;font-size:12px;line-height:1.6;color:#6b7280;">
                  Questions? Reply to this email or call us on <strong>0403983009</strong>.
                  We appreciate your business.
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

function buildQuoteEmailText(input: CustomerQuoteEmailInput) {
  const { booking, quoteAmount, quoteEta, quoteMessage, services, validUntil } = input

  const lines = [
    "Phone Garage - Repair Quote",
    `Reference: ${booking.bookingRef}`,
    `Issued: ${toDisplayDate(new Date())}`,
    `Valid Until: ${toDisplayDate(validUntil)}`,
    "",
    `Customer: ${booking.customerName}`,
    `Device: ${(booking.brandName || "").trim()} ${(booking.modelName || "").trim()}`.trim(),
    "",
    "Included Services:",
    ...(services.length > 0 ? services.map((service) => `- ${service}`) : ["- General repair service"]),
    "",
    `Turnaround: ${quoteEta?.trim() || "Quoted after inspection"}`,
    `Total Quote (AUD): ${formatQuoteAmount(quoteAmount)}`,
    "",
    quoteMessage?.trim()
      ? `Technician Note: ${quoteMessage.trim()}`
      : "Technician Note: Thank you for choosing Phone Garage. We are ready to proceed as soon as you confirm.",
    "",
    "For any questions, reply to this email or call 0403983009.",
  ]

  return lines.join("\n")
}

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim() || ""
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() || "Phone Garage <onboarding@resend.dev>"
  const shopOwnerEmail = process.env.SHOP_OWNER_EMAIL?.trim() || ""

  const firstOwnerEmail = shopOwnerEmail
    .split(",")
    .map((item) => item.trim())
    .find(Boolean)

  return {
    apiKey,
    fromEmail,
    replyTo: extractEmail(firstOwnerEmail || "") || extractEmail(fromEmail) || "",
  }
}

export function isCustomerQuoteEmailConfigured() {
  const config = getEmailConfig()
  return Boolean(config.apiKey) && Boolean(config.fromEmail)
}

export async function sendCustomerQuoteEmail(
  input: CustomerQuoteEmailInput
): Promise<CustomerQuoteEmailResult> {
  const config = getEmailConfig()
  if (!config.apiKey) {
    return {
      ok: false,
      error: "RESEND_API_KEY is missing.",
      retryable: true,
    }
  }

  const recipient = input.booking.customerEmail.trim()
  if (!isValidEmail(recipient)) {
    return {
      ok: false,
      error: "Customer email is missing or invalid.",
      retryable: false,
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `customer-quote-${input.booking.bookingRef}`,
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: [recipient],
        ...(config.replyTo ? { reply_to: config.replyTo } : {}),
        subject: `Your Phone Garage Quote • ${input.booking.bookingRef}`,
        html: buildQuoteEmailHtml(input),
        text: buildQuoteEmailText(input),
      }),
      signal: controller.signal,
    })

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; error?: { message?: string } }
      | null

    if (!response.ok) {
      const message =
        payload?.error?.message ||
        payload?.message ||
        `Resend API request failed with status ${response.status}.`
      return {
        ok: false,
        error: message,
        retryable: response.status >= 500 || response.status === 429,
      }
    }

    return {
      ok: true,
      messageId: payload?.id || null,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        ok: false,
        error: error.message,
        retryable: true,
      }
    }

    return {
      ok: false,
      error: "Unknown error while sending customer quote email.",
      retryable: true,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
