import { NextResponse } from "next/server"
import { isAdminAuthenticatedFromRequest } from "@/lib/admin-auth"
import { listMarketingRecipients } from "@/lib/booking-store"
import {
  isMarketingEmailConfigured,
  sendBulkMarketingEmail,
} from "@/lib/marketing-email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DEFAULT_AUDIENCE_LIMIT = 2500
const PREVIEW_RECIPIENT_LIMIT = 8

function isAuthorized(request: Request) {
  if (isAdminAuthenticatedFromRequest(request)) return true

  const requiredSecret = process.env.BOOKINGS_API_SECRET?.trim()
  if (!requiredSecret) return false

  const providedFromHeader = request.headers.get("x-bookings-secret")?.trim()
  if (providedFromHeader && providedFromHeader === requiredSecret) return true

  const url = new URL(request.url)
  const providedFromQuery = url.searchParams.get("secret")?.trim()
  if (providedFromQuery && providedFromQuery === requiredSecret) return true

  return false
}

function asTrimmedString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, maxLength)
}

function normalizeEmailKey(value: string) {
  return value.trim().toLowerCase()
}

function parseSelectedEmails(value: unknown) {
  if (!Array.isArray(value)) {
    return { provided: false, emails: [] as string[] }
  }

  const selectedEmails: string[] = []
  const seen = new Set<string>()

  for (const item of value) {
    if (typeof item !== "string") continue
    const normalized = normalizeEmailKey(item).slice(0, 254)
    if (!normalized || seen.has(normalized)) continue

    seen.add(normalized)
    selectedEmails.push(normalized)

    if (selectedEmails.length >= DEFAULT_AUDIENCE_LIMIT) break
  }

  return { provided: true, emails: selectedEmails }
}

function getAudienceLimit(url: URL) {
  const parsed = Number(url.searchParams.get("limit"))
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_AUDIENCE_LIMIT
  return Math.max(1, Math.min(5000, Math.floor(parsed)))
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const recipients = listMarketingRecipients(getAudienceLimit(url))

    return NextResponse.json({
      ok: true,
      configured: isMarketingEmailConfigured(),
      recipientCount: recipients.length,
      recipients,
      previewRecipients: recipients.slice(0, PREVIEW_RECIPIENT_LIMIT),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    console.error("[marketing/bulk-email] GET failed:", message)
    return NextResponse.json(
      {
        error: "Failed to load marketing audience",
        message,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json().catch(() => null)) as
      | {
          subject?: unknown
          offerTitle?: unknown
          message?: unknown
          selectedEmails?: unknown
        }
      | null

    const subject = asTrimmedString(body?.subject, 160)
    const offerTitle = asTrimmedString(body?.offerTitle, 140)
    const message = asTrimmedString(body?.message, 8000)
    const selectedEmails = parseSelectedEmails(body?.selectedEmails)

    if (!subject) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          message: "Subject is required.",
        },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          message: "Campaign message is required.",
        },
        { status: 400 }
      )
    }

    const recipients = listMarketingRecipients(DEFAULT_AUDIENCE_LIMIT)
    if (recipients.length === 0) {
      return NextResponse.json(
        {
          error: "No recipients",
          message: "No valid customer emails were found.",
        },
        { status: 400 }
      )
    }

    let campaignRecipients = recipients
    if (selectedEmails.provided) {
      if (selectedEmails.emails.length === 0) {
        return NextResponse.json(
          {
            error: "No selected recipients",
            message: "Select at least one customer before sending.",
          },
          { status: 400 }
        )
      }

      const selectedSet = new Set(selectedEmails.emails)
      campaignRecipients = recipients.filter((recipient) =>
        selectedSet.has(normalizeEmailKey(recipient.email))
      )

      if (campaignRecipients.length === 0) {
        return NextResponse.json(
          {
            error: "Selected recipients not found",
            message: "Selected customers are no longer available in the audience.",
          },
          { status: 400 }
        )
      }
    }

    const sendResult = await sendBulkMarketingEmail({
      subject,
      offerTitle: offerTitle || null,
      message,
      recipients: campaignRecipients,
    })

    if (!sendResult.ok) {
      return NextResponse.json(
        {
          error: "Campaign send failed",
          message: sendResult.error,
          retryable: sendResult.retryable,
          sentCount: sendResult.sentCount,
          attemptedCount: sendResult.attemptedCount,
        },
        {
          status: sendResult.retryable ? 502 : 400,
        }
      )
    }

    return NextResponse.json({
      ok: true,
      message: `Campaign sent to ${sendResult.sentCount} customer${
        sendResult.sentCount === 1 ? "" : "s"
      }.`,
      selectedCount: campaignRecipients.length,
      sentCount: sendResult.sentCount,
      attemptedCount: sendResult.attemptedCount,
      batchesSent: sendResult.batchesSent,
      messageIds: sendResult.messageIds,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    console.error("[marketing/bulk-email] POST failed:", message)
    return NextResponse.json(
      {
        error: "Failed to send campaign",
        message,
      },
      { status: 500 }
    )
  }
}
