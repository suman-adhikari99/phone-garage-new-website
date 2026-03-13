import { randomUUID } from "node:crypto"
import type { PostgrestError } from "@supabase/supabase-js"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export type CreateRepairBookingInput = {
  brandId: string | null
  brandName: string | null
  modelId: string | null
  modelName: string | null
  serviceId: string | null
  serviceSlug: string | null
  serviceName: string | null
  estimatedCost: string | null
  estimatedTime: string | null
  appointmentDate: string
  appointmentTime: string
  storeLocation: string
  submissionSource: string | null
  customerName: string
  customerPhone: string
  customerEmail: string
  company: string | null
  issueNotes: string | null
}

export type SavedRepairBooking = {
  id: number
  bookingRef: string
  createdAt: number
}

export type RepairBookingRecord = {
  id: number
  bookingRef: string
  status: string
  createdAt: number
  brandId: string | null
  brandName: string | null
  modelId: string | null
  modelName: string | null
  serviceId: string | null
  serviceSlug: string | null
  serviceName: string | null
  customerServiceName: string | null
  inspectionServiceName: string | null
  estimatedCost: string | null
  estimatedTime: string | null
  appointmentDate: string
  appointmentTime: string
  storeLocation: string
  submissionSource: string | null
  customerName: string
  customerPhone: string
  customerEmail: string
  company: string | null
  issueNotes: string | null
  inspectionNotes: string | null
  quoteLineItems: string | null
  quoteGeneratedAt: number | null
}

export type UpdateRepairBookingStatusResult =
  | { ok: true; booking: RepairBookingRecord }
  | { ok: false; reason: "not_found" | "invalid_status" }

export type UpdateRepairBookingInput = {
  status?: string
  serviceName?: string | null
  customerServiceName?: string | null
  inspectionServiceName?: string | null
  estimatedCost?: string | null
  estimatedTime?: string | null
  issueNotes?: string | null
  inspectionNotes?: string | null
  quoteLineItems?: string | null
  quoteGeneratedAt?: number | null
}

export type UpdateRepairBookingResult =
  | { ok: true; booking: RepairBookingRecord }
  | { ok: false; reason: "not_found" | "invalid_status" | "no_changes" }

export type BookingSubmissionIdempotencyState =
  | { status: "acquired" }
  | { status: "replay"; bookingRef: string }
  | { status: "in_progress" }

export type BookingOwnerNotificationRecord = {
  bookingRef: string
  status: "pending" | "failed" | "sent"
  attempts: number
  resendMessageId: string | null
  lastError: string | null
  lastAttemptAt: number | null
  sentAt: number | null
  createdAt: number
  updatedAt: number
}

export type MarketingRecipientRecord = {
  email: string
  customerName: string | null
  lastSeenAt: number
  bookingCount: number
}

type RepairBookingRow = {
  id: number | string
  booking_ref: string
  status: string
  created_at: number | string
  brand_id: string | null
  brand_name: string | null
  model_id: string | null
  model_name: string | null
  service_id: string | null
  service_slug: string | null
  service_name: string | null
  customer_service_name: string | null
  inspection_service_name: string | null
  estimated_cost: string | null
  estimated_time: string | null
  appointment_date: string
  appointment_time: string
  store_location: string
  submission_source: string | null
  customer_name: string
  customer_phone: string
  customer_email: string
  company: string | null
  issue_notes: string | null
  inspection_notes: string | null
  quote_line_items: string | null
  quote_generated_at: number | string | null
}

type OwnerNotificationRow = {
  booking_ref: string
  status: string
  attempts: number | string
  resend_message_id: string | null
  last_error: string | null
  last_attempt_at: number | string | null
  sent_at: number | string | null
  created_at: number | string
  updated_at: number | string
}

const BOOKING_SELECT_COLUMNS = `
  id,
  booking_ref,
  status,
  created_at,
  brand_id,
  brand_name,
  model_id,
  model_name,
  service_id,
  service_slug,
  service_name,
  customer_service_name,
  inspection_service_name,
  estimated_cost,
  estimated_time,
  appointment_date,
  appointment_time,
  store_location,
  submission_source,
  customer_name,
  customer_phone,
  customer_email,
  company,
  issue_notes,
  inspection_notes,
  quote_line_items,
  quote_generated_at
`

const OWNER_NOTIFICATION_SELECT_COLUMNS = `
  booking_ref,
  status,
  attempts,
  resend_message_id,
  last_error,
  last_attempt_at,
  sent_at,
  created_at,
  updated_at
`

const ALLOWED_BOOKING_STATUSES = new Set([
  "new",
  "in_progress",
  "quote_sent",
  "awaiting_customer",
  "booked_in",
  "completed",
  "cancelled",
])

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function formatSupabaseError(context: string, error: PostgrestError | null) {
  if (!error) return `${context} failed.`
  const details = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" | ")
  return details ? `${context} failed: ${details}` : `${context} failed.`
}

function normalizeBookingStatus(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function normalizeOptionalText(value: string | null | undefined, maxLength: number) {
  if (value === null) return null
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

function normalizeOptionalTimestamp(value: number | null | undefined) {
  if (value === null) return null
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  if (value <= 0) return null
  return Math.floor(value)
}

function combineServiceNames(
  customerServiceName: string | null,
  inspectionServiceName: string | null
) {
  const parts = [customerServiceName, inspectionServiceName].filter(
    (value): value is string => Boolean(value?.trim())
  )
  return parts.length > 0 ? parts.join(", ") : null
}

function normalizeIdempotencyKey(key: string) {
  return key.trim().slice(0, 160)
}

function normalizeNotificationStatus(value: string | null | undefined) {
  if (value === "sent" || value === "failed") return value
  return "pending"
}

function mapRepairBookingRow(row: RepairBookingRow): RepairBookingRecord {
  return {
    id: toNumber(row.id),
    bookingRef: row.booking_ref,
    status: row.status,
    createdAt: toNumber(row.created_at),
    brandId: row.brand_id,
    brandName: row.brand_name,
    modelId: row.model_id,
    modelName: row.model_name,
    serviceId: row.service_id,
    serviceSlug: row.service_slug,
    serviceName: row.service_name,
    customerServiceName: row.customer_service_name,
    inspectionServiceName: row.inspection_service_name,
    estimatedCost: row.estimated_cost,
    estimatedTime: row.estimated_time,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    storeLocation: row.store_location,
    submissionSource: row.submission_source,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    company: row.company,
    issueNotes: row.issue_notes,
    inspectionNotes: row.inspection_notes,
    quoteLineItems: row.quote_line_items,
    quoteGeneratedAt:
      row.quote_generated_at === null ? null : toNumber(row.quote_generated_at),
  }
}

function mapOwnerNotificationRow(row: OwnerNotificationRow): BookingOwnerNotificationRecord {
  return {
    bookingRef: row.booking_ref,
    status: normalizeNotificationStatus(row.status),
    attempts: toNumber(row.attempts),
    resendMessageId: row.resend_message_id,
    lastError: row.last_error,
    lastAttemptAt:
      row.last_attempt_at === null ? null : toNumber(row.last_attempt_at),
    sentAt: row.sent_at === null ? null : toNumber(row.sent_at),
    createdAt: toNumber(row.created_at),
    updatedAt: toNumber(row.updated_at),
  }
}

export async function saveRepairBooking(
  payload: CreateRepairBookingInput
): Promise<SavedRepairBooking> {
  const bookingRef = `PG-${randomUUID().slice(0, 8).toUpperCase()}`
  const createdAt = Date.now()
  const client = getSupabaseAdminClient()

  const { data, error } = await client
    .from("repair_bookings")
    .insert({
      booking_ref: bookingRef,
      created_at: createdAt,
      brand_id: payload.brandId,
      brand_name: payload.brandName,
      model_id: payload.modelId,
      model_name: payload.modelName,
      service_id: payload.serviceId,
      service_slug: payload.serviceSlug,
      service_name: payload.serviceName,
      customer_service_name: payload.serviceName,
      inspection_service_name: null,
      estimated_cost: payload.estimatedCost,
      estimated_time: payload.estimatedTime,
      appointment_date: payload.appointmentDate,
      appointment_time: payload.appointmentTime,
      store_location: payload.storeLocation,
      submission_source: normalizeOptionalText(payload.submissionSource, 120),
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      customer_email: payload.customerEmail,
      company: payload.company,
      issue_notes: payload.issueNotes,
      inspection_notes: null,
      quote_line_items: null,
      quote_generated_at: null,
    })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(formatSupabaseError("Saving booking", error))
  }

  return {
    id: toNumber((data as { id: number | string }).id),
    bookingRef,
    createdAt,
  }
}

export async function listRepairBookings(limit = 50): Promise<RepairBookingRecord[]> {
  const safeLimit = Math.max(1, Math.min(200, Math.floor(Number(limit) || 50)))
  const client = getSupabaseAdminClient()

  const { data, error } = await client
    .from("repair_bookings")
    .select(BOOKING_SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(safeLimit)

  if (error) {
    throw new Error(formatSupabaseError("Loading bookings", error))
  }

  return ((data || []) as RepairBookingRow[]).map(mapRepairBookingRow)
}

function normalizeEmailKey(value: string) {
  return value.trim().toLowerCase()
}

function isValidMarketingEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalizeCustomerName(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed.slice(0, 160) : null
}

export async function listMarketingRecipients(
  limit = 2500
): Promise<MarketingRecipientRecord[]> {
  const safeLimit = Math.max(1, Math.min(5000, Math.floor(Number(limit) || 2500)))
  const rowLimit = Math.max(safeLimit * 4, safeLimit)
  const client = getSupabaseAdminClient()

  const { data, error } = await client
    .from("repair_bookings")
    .select("customer_name, customer_email, created_at")
    .order("created_at", { ascending: false })
    .limit(rowLimit)

  if (error) {
    throw new Error(formatSupabaseError("Loading marketing recipients", error))
  }

  const recipients = new Map<string, MarketingRecipientRecord>()

  for (const row of (data || []) as Array<{
    customer_name: string | null
    customer_email: string | null
    created_at: number | string
  }>) {
    const email = row.customer_email?.trim() || ""
    if (!isValidMarketingEmail(email)) continue

    const key = normalizeEmailKey(email)
    const existing = recipients.get(key)
    if (existing) {
      existing.bookingCount += 1
      continue
    }

    recipients.set(key, {
      email,
      customerName: normalizeCustomerName(row.customer_name),
      lastSeenAt: toNumber(row.created_at),
      bookingCount: 1,
    })

    if (recipients.size >= safeLimit) break
  }

  return Array.from(recipients.values())
}

export async function getRepairBookingByRef(
  bookingRef: string
): Promise<RepairBookingRecord | null> {
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return null

  const client = getSupabaseAdminClient()
  const { data, error } = await client
    .from("repair_bookings")
    .select(BOOKING_SELECT_COLUMNS)
    .eq("booking_ref", normalizedRef)
    .maybeSingle()

  if (error) {
    throw new Error(formatSupabaseError(`Loading booking ${normalizedRef}`, error))
  }

  if (!data) return null
  return mapRepairBookingRow(data as RepairBookingRow)
}

export async function updateRepairBooking(
  bookingRef: string,
  updates: UpdateRepairBookingInput
): Promise<UpdateRepairBookingResult> {
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return { ok: false, reason: "not_found" }

  const existingBooking = await getRepairBookingByRef(normalizedRef)
  if (!existingBooking) return { ok: false, reason: "not_found" }

  const rowUpdates: Record<string, string | number | null> = {}

  if (typeof updates.status === "string") {
    const normalizedStatus = normalizeBookingStatus(updates.status)
    if (!ALLOWED_BOOKING_STATUSES.has(normalizedStatus)) {
      return { ok: false, reason: "invalid_status" }
    }

    rowUpdates.status = normalizedStatus
  }

  let nextCustomerServiceName = normalizeOptionalText(
    existingBooking.customerServiceName ?? existingBooking.serviceName,
    2000
  )
  let nextInspectionServiceName = normalizeOptionalText(
    existingBooking.inspectionServiceName,
    2000
  )

  const hasLegacyServiceUpdate = updates.serviceName !== undefined
  const hasSplitServiceUpdate =
    updates.customerServiceName !== undefined ||
    updates.inspectionServiceName !== undefined

  if (hasLegacyServiceUpdate && !hasSplitServiceUpdate) {
    nextCustomerServiceName = normalizeOptionalText(updates.serviceName, 2000)
    nextInspectionServiceName = null
  }

  if (updates.customerServiceName !== undefined) {
    nextCustomerServiceName = normalizeOptionalText(updates.customerServiceName, 2000)
  }

  if (updates.inspectionServiceName !== undefined) {
    nextInspectionServiceName = normalizeOptionalText(updates.inspectionServiceName, 2000)
  }

  if (hasLegacyServiceUpdate || hasSplitServiceUpdate) {
    rowUpdates.service_name = combineServiceNames(
      nextCustomerServiceName,
      nextInspectionServiceName
    )
    rowUpdates.customer_service_name = nextCustomerServiceName
    rowUpdates.inspection_service_name = nextInspectionServiceName
  }

  if (updates.estimatedCost !== undefined) {
    rowUpdates.estimated_cost = normalizeOptionalText(updates.estimatedCost, 120)
  }

  if (updates.estimatedTime !== undefined) {
    rowUpdates.estimated_time = normalizeOptionalText(updates.estimatedTime, 120)
  }

  if (updates.issueNotes !== undefined) {
    rowUpdates.issue_notes = normalizeOptionalText(updates.issueNotes, 5000)
  }

  if (updates.inspectionNotes !== undefined) {
    rowUpdates.inspection_notes = normalizeOptionalText(updates.inspectionNotes, 5000)
  }

  if (updates.quoteLineItems !== undefined) {
    rowUpdates.quote_line_items = normalizeOptionalText(updates.quoteLineItems, 20000)
  }

  if (updates.quoteGeneratedAt !== undefined) {
    rowUpdates.quote_generated_at = normalizeOptionalTimestamp(updates.quoteGeneratedAt)
  }

  if (Object.keys(rowUpdates).length === 0) {
    return { ok: false, reason: "no_changes" }
  }

  const client = getSupabaseAdminClient()
  const { data, error } = await client
    .from("repair_bookings")
    .update(rowUpdates)
    .eq("booking_ref", normalizedRef)
    .select(BOOKING_SELECT_COLUMNS)
    .maybeSingle()

  if (error) {
    throw new Error(formatSupabaseError(`Updating booking ${normalizedRef}`, error))
  }

  if (!data) return { ok: false, reason: "not_found" }
  return { ok: true, booking: mapRepairBookingRow(data as RepairBookingRow) }
}

export async function updateRepairBookingStatus(
  bookingRef: string,
  status: string
): Promise<UpdateRepairBookingStatusResult> {
  const result = await updateRepairBooking(bookingRef, { status })
  if (!result.ok) {
    if (result.reason === "invalid_status") {
      return { ok: false, reason: "invalid_status" }
    }
    return { ok: false, reason: "not_found" }
  }

  return result
}

export async function reserveBookingSubmissionIdempotencyKey(
  idempotencyKey: string
): Promise<BookingSubmissionIdempotencyState> {
  const normalizedKey = normalizeIdempotencyKey(idempotencyKey)
  if (!normalizedKey) return { status: "acquired" }

  const client = getSupabaseAdminClient()
  const { data, error } = await client.rpc(
    "reserve_booking_submission_idempotency",
    {
      p_idempotency_key: normalizedKey,
      p_created_at: Date.now(),
    }
  )

  if (error) {
    throw new Error(formatSupabaseError("Reserving idempotency key", error))
  }

  const payload = (data || {}) as {
    status?: unknown
    bookingRef?: unknown
    booking_ref?: unknown
  }
  const status =
    payload.status === "acquired" ||
    payload.status === "replay" ||
    payload.status === "in_progress"
      ? payload.status
      : "in_progress"

  if (status === "replay") {
    const bookingRefValue =
      typeof payload.bookingRef === "string"
        ? payload.bookingRef
        : typeof payload.booking_ref === "string"
          ? payload.booking_ref
          : ""

    if (bookingRefValue.trim()) {
      return { status: "replay", bookingRef: bookingRefValue.trim() }
    }
  }

  return status === "acquired" ? { status: "acquired" } : { status: "in_progress" }
}

export async function completeBookingSubmissionIdempotencyKey(
  idempotencyKey: string,
  bookingRef: string
) {
  const normalizedKey = normalizeIdempotencyKey(idempotencyKey)
  if (!normalizedKey) return

  const client = getSupabaseAdminClient()
  const { error } = await client
    .from("booking_submission_idempotency")
    .update({
      booking_ref: bookingRef.trim(),
      updated_at: Date.now(),
    })
    .eq("idempotency_key", normalizedKey)

  if (error) {
    throw new Error(formatSupabaseError("Completing idempotency key", error))
  }
}

export async function releaseBookingSubmissionIdempotencyKey(idempotencyKey: string) {
  const normalizedKey = normalizeIdempotencyKey(idempotencyKey)
  if (!normalizedKey) return

  const client = getSupabaseAdminClient()
  const { error } = await client
    .from("booking_submission_idempotency")
    .delete()
    .eq("idempotency_key", normalizedKey)
    .is("booking_ref", null)

  if (error) {
    throw new Error(formatSupabaseError("Releasing idempotency key", error))
  }
}

export async function enqueueBookingOwnerNotification(bookingRef: string) {
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return

  const existing = await getBookingOwnerNotificationByRef(normalizedRef)
  if (existing) return

  const now = Date.now()
  const client = getSupabaseAdminClient()
  const { error } = await client.from("booking_owner_notifications").insert({
    booking_ref: normalizedRef,
    status: "pending",
    attempts: 0,
    resend_message_id: null,
    last_error: null,
    last_attempt_at: null,
    sent_at: null,
    created_at: now,
    updated_at: now,
  })

  if (error) {
    throw new Error(formatSupabaseError("Queueing owner notification", error))
  }
}

export async function getBookingOwnerNotificationByRef(
  bookingRef: string
): Promise<BookingOwnerNotificationRecord | null> {
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return null

  const client = getSupabaseAdminClient()
  const { data, error } = await client
    .from("booking_owner_notifications")
    .select(OWNER_NOTIFICATION_SELECT_COLUMNS)
    .eq("booking_ref", normalizedRef)
    .maybeSingle()

  if (error) {
    throw new Error(
      formatSupabaseError(`Loading owner notification ${normalizedRef}`, error)
    )
  }

  if (!data) return null
  return mapOwnerNotificationRow(data as OwnerNotificationRow)
}

export async function listRetryableBookingOwnerNotifications(
  limit = 10,
  maxAttempts = 8
): Promise<BookingOwnerNotificationRecord[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 10)))
  const safeMaxAttempts = Math.max(
    1,
    Math.min(100, Math.floor(Number(maxAttempts) || 8))
  )
  const client = getSupabaseAdminClient()

  const { data, error } = await client
    .from("booking_owner_notifications")
    .select(OWNER_NOTIFICATION_SELECT_COLUMNS)
    .neq("status", "sent")
    .lt("attempts", safeMaxAttempts)
    .limit(safeLimit * 3)

  if (error) {
    throw new Error(formatSupabaseError("Loading retryable notifications", error))
  }

  return ((data || []) as OwnerNotificationRow[])
    .map(mapOwnerNotificationRow)
    .sort((a, b) => {
      const aLastAttempt = a.lastAttemptAt ?? 0
      const bLastAttempt = b.lastAttemptAt ?? 0
      if (aLastAttempt !== bLastAttempt) return aLastAttempt - bLastAttempt
      return a.createdAt - b.createdAt
    })
    .slice(0, safeLimit)
}

async function writeOwnerNotification(
  bookingRef: string,
  values: {
    status: "sent" | "failed"
    resendMessageId: string | null
    lastError: string | null
    sentAt: number | null
  }
) {
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return

  const existing = await getBookingOwnerNotificationByRef(normalizedRef)
  const now = Date.now()
  const attempts = (existing?.attempts || 0) + 1
  const row = {
    booking_ref: normalizedRef,
    status: values.status,
    attempts,
    resend_message_id: values.resendMessageId,
    last_error: values.lastError,
    last_attempt_at: now,
    sent_at: values.sentAt,
    created_at: existing?.createdAt || now,
    updated_at: now,
  }

  const client = getSupabaseAdminClient()
  const { error } = existing
    ? await client
        .from("booking_owner_notifications")
        .update(row)
        .eq("booking_ref", normalizedRef)
    : await client.from("booking_owner_notifications").insert(row)

  if (error) {
    throw new Error(formatSupabaseError("Updating owner notification", error))
  }
}

export async function recordBookingOwnerNotificationSent(
  bookingRef: string,
  resendMessageId: string | null
) {
  await writeOwnerNotification(bookingRef, {
    status: "sent",
    resendMessageId,
    lastError: null,
    sentAt: Date.now(),
  })
}

export async function recordBookingOwnerNotificationFailure(
  bookingRef: string,
  errorMessage: string
) {
  await writeOwnerNotification(bookingRef, {
    status: "failed",
    resendMessageId: null,
    lastError: errorMessage.trim().slice(0, 2000) || "Email send failed",
    sentAt: null,
  })
}
