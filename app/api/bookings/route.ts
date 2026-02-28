import { NextResponse } from "next/server"
import {
  completeBookingSubmissionIdempotencyKey,
  enqueueBookingOwnerNotification,
  getBookingOwnerNotificationByRef,
  getRepairBookingByRef,
  listRepairBookings,
  listRetryableBookingOwnerNotifications,
  recordBookingOwnerNotificationFailure,
  recordBookingOwnerNotificationSent,
  releaseBookingSubmissionIdempotencyKey,
  reserveBookingSubmissionIdempotencyKey,
  saveRepairBooking,
  updateRepairBooking,
  type CreateRepairBookingInput,
} from "@/lib/booking-store"
import {
  isOwnerBookingEmailConfigured,
  sendBookingOwnerEmail,
} from "@/lib/booking-owner-email"
import {
  getBookingEmailAttachments,
  saveBookingImageUploads,
} from "@/lib/booking-image-uploads"
import { isAdminAuthenticatedFromRequest } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const OWNER_EMAIL_MAX_ATTEMPTS = getSafePositiveInt(
  process.env.OWNER_EMAIL_MAX_ATTEMPTS,
  8,
  20
)
const OWNER_EMAIL_ATTEMPTS_PER_RUN = getSafePositiveInt(
  process.env.OWNER_EMAIL_ATTEMPTS_PER_RUN,
  2,
  5
)

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

function asRequiredString(value: unknown) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function asOptionalString(value: unknown) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidPhoneDigits(value: string) {
  return /^\d{8,15}$/.test(value)
}

function parsePayload(body: unknown): CreateRepairBookingInput | null {
  if (!body || typeof body !== "object") return null
  const data = body as Record<string, unknown>

  const appointmentDate = asRequiredString(data.appointmentDate)
  const appointmentTime = asRequiredString(data.appointmentTime)
  const storeLocation = asRequiredString(data.storeLocation)
  const customerName = asRequiredString(data.customerName)
  const customerPhone = asRequiredString(data.customerPhone)
  const isQuoteRequest =
    appointmentTime === "Quote request" || storeLocation === "Website Quote Form"
  const customerEmail = isQuoteRequest
    ? asRequiredString(data.customerEmail)
    : asOptionalString(data.customerEmail) || ""

  if (
    !appointmentDate ||
    !appointmentTime ||
    !storeLocation ||
    !customerName ||
    !customerPhone ||
    (isQuoteRequest && !customerEmail)
  ) {
    return null
  }

  const normalizedCustomerEmail = customerEmail || ""

  if (normalizedCustomerEmail && !isValidEmail(normalizedCustomerEmail)) {
    return null
  }

  if (!isValidPhoneDigits(customerPhone)) {
    return null
  }

  return {
    brandId: asOptionalString(data.brandId),
    brandName: asOptionalString(data.brandName),
    modelId: asOptionalString(data.modelId),
    modelName: asOptionalString(data.modelName),
    serviceId: asOptionalString(data.serviceId),
    serviceSlug: asOptionalString(data.serviceSlug),
    serviceName: asOptionalString(data.serviceName),
    estimatedCost: asOptionalString(data.estimatedCost),
    estimatedTime: asOptionalString(data.estimatedTime),
    appointmentDate,
    appointmentTime,
    storeLocation,
    customerName,
    customerPhone,
    customerEmail: normalizedCustomerEmail,
    company: asOptionalString(data.company),
    issueNotes: asOptionalString(data.issueNotes),
  }
}

function getSafeLimit(url: URL) {
  const raw = url.searchParams.get("limit")
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return 50
  return Math.min(200, Math.floor(parsed))
}

function getSafePositiveInt(raw: string | undefined, fallback: number, max: number) {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(max, Math.floor(parsed))
}

function parseIdempotencyKey(request: Request, body: unknown) {
  const fromHeader =
    request.headers.get("idempotency-key")?.trim() ||
    request.headers.get("x-idempotency-key")?.trim() ||
    ""

  let fromBody = ""
  if (body && typeof body === "object") {
    const candidate = (body as Record<string, unknown>).idempotencyKey
    if (typeof candidate === "string") {
      fromBody = candidate.trim()
    }
  }

  const normalized = (fromHeader || fromBody).trim().slice(0, 160)
  return normalized.length > 0 ? normalized : null
}

function formDataToBody(formData: FormData) {
  const data: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      data[key] = value
    }
  }
  return data
}

function extractImageUploads(formData: FormData) {
  return formData
    .getAll("deviceImages")
    .filter((entry): entry is File => entry instanceof File)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type EmailDeliveryState =
  | "sent"
  | "pending_retry"
  | "max_attempts_reached"
  | "not_configured"
  | "booking_not_found"

async function deliverOwnerNotificationForBooking(
  bookingRef: string,
  maxAttemptsPerRun = OWNER_EMAIL_ATTEMPTS_PER_RUN
): Promise<EmailDeliveryState> {
  const booking = getRepairBookingByRef(bookingRef)
  if (!booking) return "booking_not_found"
  const attachments = await getBookingEmailAttachments(bookingRef)

  enqueueBookingOwnerNotification(bookingRef)
  const existing = getBookingOwnerNotificationByRef(bookingRef)
  if (existing?.status === "sent") return "sent"

  if (!isOwnerBookingEmailConfigured()) {
    return "not_configured"
  }

  const safeRunAttempts = Math.max(1, Math.min(5, Math.floor(maxAttemptsPerRun)))

  for (let attemptInRun = 0; attemptInRun < safeRunAttempts; attemptInRun += 1) {
    const current = getBookingOwnerNotificationByRef(bookingRef)
    if (!current) break
    if (current.status === "sent") return "sent"
    if (current.attempts >= OWNER_EMAIL_MAX_ATTEMPTS) {
      return "max_attempts_reached"
    }

    const result = await sendBookingOwnerEmail(booking, attachments)
    if (result.ok) {
      recordBookingOwnerNotificationSent(bookingRef, result.messageId)
      return "sent"
    }

    recordBookingOwnerNotificationFailure(bookingRef, result.error)

    const updated = getBookingOwnerNotificationByRef(bookingRef)
    if ((updated?.attempts || 0) >= OWNER_EMAIL_MAX_ATTEMPTS) {
      return "max_attempts_reached"
    }

    if (!result.retryable) {
      return "pending_retry"
    }

    if (attemptInRun < safeRunAttempts - 1) {
      await sleep(Math.min(1500, 250 * 2 ** attemptInRun))
    }
  }

  return "pending_retry"
}

async function retryPendingOwnerNotifications(limit = 2, skipBookingRef?: string) {
  const retryable = listRetryableBookingOwnerNotifications(
    limit + (skipBookingRef ? 1 : 0),
    OWNER_EMAIL_MAX_ATTEMPTS
  )

  for (const item of retryable) {
    if (skipBookingRef && item.bookingRef === skipBookingRef) continue
    await deliverOwnerNotificationForBooking(item.bookingRef, 1)
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await retryPendingOwnerNotifications(1)

    const url = new URL(request.url)
    const bookingRef = url.searchParams.get("bookingRef")?.trim()

    if (bookingRef) {
      const booking = getRepairBookingByRef(bookingRef)
      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found", bookingRef },
          { status: 404 }
        )
      }

      return NextResponse.json({
        ok: true,
        booking,
      })
    }

    const limit = getSafeLimit(url)
    const bookings = listRepairBookings(limit)
    return NextResponse.json({
      ok: true,
      count: bookings.length,
      limit,
      bookings,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    console.error("[bookings] GET failed:", message)
    return NextResponse.json(
      { error: "Failed to load bookings", message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  // Customer booking submissions must stay public.
  // Secret/admin auth is enforced on read/update routes.

  let idempotencyKey: string | null = null
  let idempotencyReserved = false
  let uploadedImages: File[] = []

  try {
    const contentType = request.headers.get("content-type")?.toLowerCase() || ""
    let body: unknown

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      body = formDataToBody(formData)
      uploadedImages = extractImageUploads(formData)
    } else {
      body = await request.json()
    }

    const payload = parsePayload(body)

    if (!payload) {
      return NextResponse.json(
        {
          error: "Invalid booking payload",
          message: "Required booking details are missing or invalid.",
        },
        { status: 400 }
      )
    }

    idempotencyKey = parseIdempotencyKey(request, body)
    if (idempotencyKey) {
      const reservation = reserveBookingSubmissionIdempotencyKey(idempotencyKey)

      if (reservation.status === "in_progress") {
        return NextResponse.json(
          {
            error: "Request is already processing",
            message:
              "This idempotent request key is currently being processed. Please retry shortly.",
          },
          { status: 409 }
        )
      }

      if (reservation.status === "replay") {
        const existingBooking = getRepairBookingByRef(reservation.bookingRef)
        if (existingBooking) {
          const emailStatus = await deliverOwnerNotificationForBooking(
            existingBooking.bookingRef,
            1
          )
          return NextResponse.json({
            ok: true,
            bookingId: existingBooking.id,
            bookingRef: existingBooking.bookingRef,
            createdAt: existingBooking.createdAt,
            emailStatus,
            idempotentReplay: true,
          })
        }

        // Stale idempotency record without matching booking: release and continue as new.
        releaseBookingSubmissionIdempotencyKey(idempotencyKey)
        const refreshedReservation =
          reserveBookingSubmissionIdempotencyKey(idempotencyKey)
        if (refreshedReservation.status === "in_progress") {
          return NextResponse.json(
            {
              error: "Request is already processing",
              message:
                "This idempotent request key is currently being processed. Please retry shortly.",
            },
            { status: 409 }
          )
        }

        if (refreshedReservation.status === "replay") {
          const fallbackReplay = getRepairBookingByRef(
            refreshedReservation.bookingRef
          )
          if (fallbackReplay) {
            return NextResponse.json({
              ok: true,
              bookingId: fallbackReplay.id,
              bookingRef: fallbackReplay.bookingRef,
              createdAt: fallbackReplay.createdAt,
              emailStatus: await deliverOwnerNotificationForBooking(
                fallbackReplay.bookingRef,
                1
              ),
              idempotentReplay: true,
            })
          }
        } else {
          idempotencyReserved = true
        }
      } else {
        idempotencyReserved = true
      }
    }

    const booking = saveRepairBooking(payload)
    if (uploadedImages.length > 0) {
      try {
        await saveBookingImageUploads(booking.bookingRef, uploadedImages)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown upload save error"
        console.error(
          `[bookings] failed to persist upload images for ${booking.bookingRef}:`,
          message
        )
      }
    }

    if (idempotencyKey && idempotencyReserved) {
      completeBookingSubmissionIdempotencyKey(idempotencyKey, booking.bookingRef)
      idempotencyReserved = false
    }

    enqueueBookingOwnerNotification(booking.bookingRef)
    const emailStatus = await deliverOwnerNotificationForBooking(booking.bookingRef)
    await retryPendingOwnerNotifications(2, booking.bookingRef)

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      createdAt: booking.createdAt,
      emailStatus,
      idempotentReplay: false,
    })
  } catch (error) {
    if (idempotencyKey && idempotencyReserved) {
      releaseBookingSubmissionIdempotencyKey(idempotencyKey)
    }

    const message = error instanceof Error ? error.message : "Unexpected error"
    console.error("[bookings] POST failed:", message)
    return NextResponse.json(
      { error: "Failed to save booking", message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json().catch(() => null)) as
      | {
          bookingRef?: unknown
          status?: unknown
          serviceName?: unknown
          customerServiceName?: unknown
          inspectionServiceName?: unknown
          estimatedCost?: unknown
          estimatedTime?: unknown
          issueNotes?: unknown
          inspectionNotes?: unknown
          quoteLineItems?: unknown
          quoteGeneratedAt?: unknown
        }
      | null

    const bookingRef =
      typeof body?.bookingRef === "string" ? body.bookingRef.trim() : ""
    const status =
      typeof body?.status === "string" && body.status.trim()
        ? body.status.trim()
        : undefined
    const serviceName =
      body?.serviceName === null
        ? null
        : typeof body?.serviceName === "string"
          ? body.serviceName
          : undefined
    const customerServiceName =
      body?.customerServiceName === null
        ? null
        : typeof body?.customerServiceName === "string"
          ? body.customerServiceName
          : undefined
    const inspectionServiceName =
      body?.inspectionServiceName === null
        ? null
        : typeof body?.inspectionServiceName === "string"
          ? body.inspectionServiceName
          : undefined
    const estimatedCost =
      body?.estimatedCost === null
        ? null
        : typeof body?.estimatedCost === "string"
          ? body.estimatedCost
          : undefined
    const estimatedTime =
      body?.estimatedTime === null
        ? null
        : typeof body?.estimatedTime === "string"
          ? body.estimatedTime
          : undefined
    const issueNotes =
      body?.issueNotes === null
        ? null
        : typeof body?.issueNotes === "string"
          ? body.issueNotes
          : undefined
    const inspectionNotes =
      body?.inspectionNotes === null
        ? null
        : typeof body?.inspectionNotes === "string"
          ? body.inspectionNotes
          : undefined
    const quoteLineItems =
      body?.quoteLineItems === null
        ? null
        : typeof body?.quoteLineItems === "string"
          ? body.quoteLineItems
          : undefined
    const quoteGeneratedAt =
      body?.quoteGeneratedAt === null
        ? null
        : typeof body?.quoteGeneratedAt === "number" &&
            Number.isFinite(body.quoteGeneratedAt)
          ? Math.floor(body.quoteGeneratedAt)
          : undefined

    if (!bookingRef) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          message: "bookingRef is required.",
        },
        { status: 400 }
      )
    }

    if (
      status === undefined &&
      serviceName === undefined &&
      customerServiceName === undefined &&
      inspectionServiceName === undefined &&
      estimatedCost === undefined &&
      estimatedTime === undefined &&
      issueNotes === undefined &&
      inspectionNotes === undefined &&
      quoteLineItems === undefined &&
      quoteGeneratedAt === undefined
    ) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          message:
            "Provide at least one update field: status, serviceName, customerServiceName, inspectionServiceName, estimatedCost, estimatedTime, issueNotes, inspectionNotes, quoteLineItems, or quoteGeneratedAt.",
        },
        { status: 400 }
      )
    }

    const result = updateRepairBooking(bookingRef, {
      status,
      serviceName,
      customerServiceName,
      inspectionServiceName,
      estimatedCost,
      estimatedTime,
      issueNotes,
      inspectionNotes,
      quoteLineItems,
      quoteGeneratedAt,
    })
    if (!result.ok) {
      if (result.reason === "invalid_status") {
        return NextResponse.json(
          {
            error: "Invalid status",
            message:
              "Allowed statuses: new, in_progress, quote_sent, awaiting_customer, booked_in, completed, cancelled.",
          },
          { status: 400 }
        )
      }

      if (result.reason === "no_changes") {
        return NextResponse.json(
          {
            error: "No changes",
            message: "No valid update fields were provided.",
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          error: "Booking not found",
          message: `No booking found for reference ${bookingRef}.`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      booking: result.booking,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    console.error("[bookings] PATCH failed:", message)
    return NextResponse.json(
      { error: "Failed to update booking", message },
      { status: 500 }
    )
  }
}
