import type { RepairBookingRecord } from "@/lib/booking-store"
import type { BookingEmailAttachment } from "@/lib/booking-image-uploads"

export type OwnerBookingEmailResult =
  | { ok: true; messageId: string | null }
  | { ok: false; error: string; retryable: boolean }

const RESEND_API_URL = "https://api.resend.com/emails"

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

function safeCell(value: string | null | undefined, fallback = "Not provided") {
  const normalized = value?.trim()
  return normalized ? escapeHtml(normalized) : fallback
}

function formatAppointmentDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
}

function buildOwnerEmailHtml(booking: RepairBookingRecord) {
  const issueNotes = booking.issueNotes?.trim()
    ? escapeHtml(booking.issueNotes.trim()).replaceAll("\n", "<br />")
    : "No additional notes provided."

  return `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px 24px 12px 24px;background:linear-gradient(135deg,#111827,#1f2937);color:#ffffff;">
                <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.8;">Phone Garage</p>
                <h1 style="margin:10px 0 0 0;font-size:22px;line-height:1.25;">New Customer Quote Request</h1>
                <p style="margin:8px 0 0 0;font-size:13px;opacity:0.9;">Reference: <strong>${escapeHtml(booking.bookingRef)}</strong></p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px 24px 24px;">
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151;">
                  A new request has been submitted from the website. Customer and requested quote details are below.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="padding:10px 12px;background:#f9fafb;font-size:12px;font-weight:600;color:#6b7280;width:34%;">Customer Name</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;">${safeCell(booking.customerName)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f9fafb;font-size:12px;font-weight:600;color:#6b7280;">Phone</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;">${safeCell(booking.customerPhone)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f9fafb;font-size:12px;font-weight:600;color:#6b7280;">Email</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;">${safeCell(booking.customerEmail)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f9fafb;font-size:12px;font-weight:600;color:#6b7280;">Device</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;">${safeCell(booking.brandName)} ${safeCell(booking.modelName, "")}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f9fafb;font-size:12px;font-weight:600;color:#6b7280;">Requested Repair</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;">${safeCell(booking.serviceName)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f9fafb;font-size:12px;font-weight:600;color:#6b7280;">Preferred Date / Time</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;">${escapeHtml(formatAppointmentDate(booking.appointmentDate))} | ${safeCell(booking.appointmentTime)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f9fafb;font-size:12px;font-weight:600;color:#6b7280;">Store / Source</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;">${safeCell(booking.storeLocation)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f9fafb;font-size:12px;font-weight:600;color:#6b7280;vertical-align:top;">Issue Details</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;line-height:1.5;">${issueNotes}</td>
                  </tr>
                </table>
                <p style="margin:16px 0 0 0;font-size:12px;color:#6b7280;">
                  Generated automatically from the website booking pipeline.
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

function buildOwnerEmailText(booking: RepairBookingRecord) {
  return [
    "New customer quote request received.",
    `Reference: ${booking.bookingRef}`,
    "",
    `Customer: ${booking.customerName}`,
    `Phone: ${booking.customerPhone}`,
    `Email: ${booking.customerEmail.trim() || "Not provided"}`,
    `Device: ${booking.brandName || "Unknown"} ${booking.modelName || ""}`.trim(),
    `Requested repair: ${booking.serviceName || "Not specified"}`,
    `Preferred date/time: ${formatAppointmentDate(booking.appointmentDate)} | ${booking.appointmentTime}`,
    `Store/source: ${booking.storeLocation}`,
    `Issue details: ${booking.issueNotes?.trim() || "No additional notes provided."}`,
  ].join("\n")
}

function getRequiredConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim() || ""
  const ownerEmailRaw = process.env.SHOP_OWNER_EMAIL?.trim() || ""
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() || "Phone Garage <onboarding@resend.dev>"

  const ownerEmails = ownerEmailRaw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)

  return {
    apiKey,
    ownerEmails,
    fromEmail,
  }
}

export function isOwnerBookingEmailConfigured() {
  const config = getRequiredConfig()
  return Boolean(config.apiKey) && config.ownerEmails.length > 0
}

export async function sendBookingOwnerEmail(
  booking: RepairBookingRecord,
  attachments: BookingEmailAttachment[] = []
): Promise<OwnerBookingEmailResult> {
  const config = getRequiredConfig()
  if (!config.apiKey) {
    return {
      ok: false,
      error: "RESEND_API_KEY is missing.",
      retryable: true,
    }
  }

  if (config.ownerEmails.length === 0) {
    return {
      ok: false,
      error: "SHOP_OWNER_EMAIL is missing.",
      retryable: true,
    }
  }

  const replyTo = booking.customerEmail.trim()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `owner-booking-${booking.bookingRef}`,
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: config.ownerEmails,
        ...(isValidEmail(replyTo) ? { reply_to: replyTo } : {}),
        subject: `New Quote Request • ${booking.bookingRef}`,
        html: buildOwnerEmailHtml(booking),
        text: buildOwnerEmailText(booking),
        ...(attachments.length > 0
          ? {
              attachments: attachments.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
              })),
            }
          : {}),
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
      error: "Unknown error while sending owner email.",
      retryable: true,
    }
  } finally {
    clearTimeout(timeout)
  }
}
