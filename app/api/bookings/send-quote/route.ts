import { NextResponse } from "next/server"
import { isAdminAuthenticatedFromRequest } from "@/lib/admin-auth"
import { sendCustomerQuoteEmail } from "@/lib/customer-quote-email"
import { getRepairBookingByRef, updateRepairBooking } from "@/lib/booking-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type SendQuoteBody = {
  bookingRef?: unknown
  quoteAmount?: unknown
  quoteEta?: unknown
  quoteMessage?: unknown
  services?: unknown
}

function isAuthorized(request: Request) {
  if (isAdminAuthenticatedFromRequest(request)) return true

  const requiredSecret = process.env.BOOKINGS_API_SECRET?.trim()
  if (!requiredSecret) return true

  const providedFromHeader = request.headers.get("x-bookings-secret")?.trim()
  if (providedFromHeader && providedFromHeader === requiredSecret) return true

  const url = new URL(request.url)
  const providedFromQuery = url.searchParams.get("secret")?.trim()
  if (providedFromQuery && providedFromQuery === requiredSecret) return true

  return false
}

function asTrimmedString(value: unknown) {
  if (typeof value !== "string") return ""
  return value.trim()
}

function splitServices(raw: string | null | undefined) {
  if (!raw?.trim()) return []
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseServiceList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
}

function parseSavedQuoteServices(value: string | null | undefined) {
  if (!value?.trim()) return []

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return ""
        const candidate = item as { service?: unknown; amount?: unknown }
        if (typeof candidate.service !== "string") return ""

        const service = candidate.service.trim()
        if (!service) return ""

        if (typeof candidate.amount === "number" && Number.isFinite(candidate.amount)) {
          return `${service} - $${candidate.amount.toFixed(2)}`
        }

        if (typeof candidate.amount === "string" && candidate.amount.trim()) {
          return `${service} - ${candidate.amount.trim()}`
        }

        return service
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json().catch(() => null)) as SendQuoteBody | null
    const bookingRef = asTrimmedString(body?.bookingRef)

    if (!bookingRef) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          message: "bookingRef is required.",
        },
        { status: 400 }
      )
    }

    const booking = getRepairBookingByRef(bookingRef)
    if (!booking) {
      return NextResponse.json(
        {
          error: "Booking not found",
          message: `No booking found for reference ${bookingRef}.`,
        },
        { status: 404 }
      )
    }

    const quoteAmount = asTrimmedString(body?.quoteAmount) || booking.estimatedCost?.trim() || ""
    if (!quoteAmount) {
      return NextResponse.json(
        {
          error: "Missing quote amount",
          message: "Add quote amount before sending to customer.",
        },
        { status: 400 }
      )
    }

    const quoteEta = asTrimmedString(body?.quoteEta) || booking.estimatedTime?.trim() || ""
    const quoteMessage = asTrimmedString(body?.quoteMessage)

    const providedServices = parseServiceList(body?.services)
    const savedQuoteServices = parseSavedQuoteServices(booking.quoteLineItems)
    const fallbackServices = [
      ...savedQuoteServices,
      ...splitServices(booking.customerServiceName),
      ...splitServices(booking.inspectionServiceName),
      ...splitServices(booking.serviceName),
    ]
    const dedupedFallbackServices = Array.from(new Set(fallbackServices))
    const services =
      providedServices.length > 0 ? providedServices : dedupedFallbackServices

    const updateResult = updateRepairBooking(bookingRef, {
      status: "quote_sent",
      estimatedCost: quoteAmount,
      estimatedTime: quoteEta || null,
    })

    if (!updateResult.ok) {
      return NextResponse.json(
        {
          error: "Quote update failed",
          message: "Could not update booking quote fields before sending.",
        },
        { status: 400 }
      )
    }

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 7)

    const emailResult = await sendCustomerQuoteEmail({
      booking: updateResult.booking,
      quoteAmount,
      quoteEta: quoteEta || null,
      quoteMessage: quoteMessage || null,
      services,
      validUntil,
    })

    if (!emailResult.ok) {
      return NextResponse.json(
        {
          error: "Quote email failed",
          message: emailResult.error,
          retryable: emailResult.retryable,
        },
        { status: emailResult.retryable ? 502 : 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      booking: updateResult.booking,
      messageId: emailResult.messageId,
      message: `Quote sent to ${updateResult.booking.customerEmail}.`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    console.error("[bookings/send-quote] failed:", message)
    return NextResponse.json(
      { error: "Failed to send quote", message },
      { status: 500 }
    )
  }
}
