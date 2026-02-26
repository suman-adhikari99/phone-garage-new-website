import { randomUUID } from "node:crypto"
import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { resolveWritableStoragePath } from "@/lib/server-storage-path"

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

const DB_PATH =
  resolveWritableStoragePath(
    process.env.REPAIR_BOOKINGS_DB_PATH,
    "data/repair-bookings.sqlite"
  )

let db: DatabaseSync | null = null

function ensureRepairBookingsColumns(database: DatabaseSync) {
  const columns = database
    .prepare("PRAGMA table_info(repair_bookings)")
    .all() as Array<{ name: string }>
  const columnNames = new Set(columns.map((column) => column.name))

  if (!columnNames.has("customer_service_name")) {
    database.exec("ALTER TABLE repair_bookings ADD COLUMN customer_service_name TEXT")
  }

  if (!columnNames.has("inspection_service_name")) {
    database.exec("ALTER TABLE repair_bookings ADD COLUMN inspection_service_name TEXT")
  }

  if (!columnNames.has("inspection_notes")) {
    database.exec("ALTER TABLE repair_bookings ADD COLUMN inspection_notes TEXT")
  }

  if (!columnNames.has("quote_line_items")) {
    database.exec("ALTER TABLE repair_bookings ADD COLUMN quote_line_items TEXT")
  }

  if (!columnNames.has("quote_generated_at")) {
    database.exec("ALTER TABLE repair_bookings ADD COLUMN quote_generated_at INTEGER")
  }

  database.exec(`
    UPDATE repair_bookings
    SET customer_service_name = service_name
    WHERE (customer_service_name IS NULL OR TRIM(customer_service_name) = '')
      AND service_name IS NOT NULL
      AND TRIM(service_name) != '';
  `)
}

function getDb() {
  if (db) return db

  mkdirSync(dirname(DB_PATH), { recursive: true })
  db = new DatabaseSync(DB_PATH)

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS repair_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_ref TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'new',
      created_at INTEGER NOT NULL,
      brand_id TEXT,
      brand_name TEXT,
      model_id TEXT,
      model_name TEXT,
      service_id TEXT,
      service_slug TEXT,
      service_name TEXT,
      customer_service_name TEXT,
      inspection_service_name TEXT,
      estimated_cost TEXT,
      estimated_time TEXT,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      store_location TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      company TEXT,
      issue_notes TEXT,
      inspection_notes TEXT,
      quote_line_items TEXT,
      quote_generated_at INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_repair_bookings_created_at
      ON repair_bookings(created_at DESC);

    CREATE TABLE IF NOT EXISTS booking_submission_idempotency (
      idempotency_key TEXT PRIMARY KEY,
      booking_ref TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_booking_submission_idempotency_created_at
      ON booking_submission_idempotency(created_at DESC);

    CREATE TABLE IF NOT EXISTS booking_owner_notifications (
      booking_ref TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      resend_message_id TEXT,
      last_error TEXT,
      last_attempt_at INTEGER,
      sent_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_booking_owner_notifications_status_updated
      ON booking_owner_notifications(status, updated_at DESC);
  `)

  ensureRepairBookingsColumns(db)

  return db
}

export function saveRepairBooking(payload: CreateRepairBookingInput): SavedRepairBooking {
  const database = getDb()
  const bookingRef = `PG-${randomUUID().slice(0, 8).toUpperCase()}`
  const createdAt = Date.now()

  const result = database
    .prepare(`
      INSERT INTO repair_bookings (
        booking_ref,
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
        customer_name,
        customer_phone,
        customer_email,
        company,
        issue_notes,
        inspection_notes,
        quote_line_items,
        quote_generated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      bookingRef,
      createdAt,
      payload.brandId,
      payload.brandName,
      payload.modelId,
      payload.modelName,
      payload.serviceId,
      payload.serviceSlug,
      payload.serviceName,
      payload.serviceName,
      null,
      payload.estimatedCost,
      payload.estimatedTime,
      payload.appointmentDate,
      payload.appointmentTime,
      payload.storeLocation,
      payload.customerName,
      payload.customerPhone,
      payload.customerEmail,
      payload.company,
      payload.issueNotes,
      null,
      null,
      null
    ) as { lastInsertRowid: number | bigint }

  const rawId = result.lastInsertRowid
  const id = typeof rawId === "bigint" ? Number(rawId) : Number(rawId)

  return {
    id: Number.isFinite(id) ? id : 0,
    bookingRef,
    createdAt,
  }
}

function mapRepairBookingRow(row: {
  id: number
  booking_ref: string
  status: string
  created_at: number
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
  customer_name: string
  customer_phone: string
  customer_email: string
  company: string | null
  issue_notes: string | null
  inspection_notes: string | null
  quote_line_items: string | null
  quote_generated_at: number | null
}): RepairBookingRecord {
  return {
    id: Number(row.id),
    bookingRef: row.booking_ref,
    status: row.status,
    createdAt: Number(row.created_at),
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
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    company: row.company,
    issueNotes: row.issue_notes,
    inspectionNotes: row.inspection_notes,
    quoteLineItems: row.quote_line_items,
    quoteGeneratedAt:
      row.quote_generated_at === null ? null : Number(row.quote_generated_at),
  }
}

export function listRepairBookings(limit = 50): RepairBookingRecord[] {
  const database = getDb()
  const safeLimit = Math.max(1, Math.min(200, Math.floor(Number(limit) || 50)))

  const rows = database
    .prepare(`
      SELECT
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
        customer_name,
        customer_phone,
        customer_email,
        company,
        issue_notes,
        inspection_notes,
        quote_line_items,
        quote_generated_at
      FROM repair_bookings
      ORDER BY created_at DESC
      LIMIT ?
    `)
    .all(safeLimit) as Array<{
    id: number
    booking_ref: string
    status: string
    created_at: number
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
    customer_name: string
    customer_phone: string
    customer_email: string
    company: string | null
    issue_notes: string | null
    inspection_notes: string | null
    quote_line_items: string | null
    quote_generated_at: number | null
  }>

  return rows.map(mapRepairBookingRow)
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

export function listMarketingRecipients(limit = 2500): MarketingRecipientRecord[] {
  const database = getDb()
  const safeLimit = Math.max(1, Math.min(5000, Math.floor(Number(limit) || 2500)))
  const rowLimit = Math.max(safeLimit * 4, safeLimit)

  const rows = database
    .prepare(`
      SELECT
        id,
        customer_name,
        customer_email,
        created_at
      FROM repair_bookings
      WHERE customer_email IS NOT NULL
        AND TRIM(customer_email) != ''
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `)
    .all(rowLimit) as Array<{
    id: number
    customer_name: string | null
    customer_email: string
    created_at: number
  }>

  const recipients = new Map<string, MarketingRecipientRecord>()

  for (const row of rows) {
    const email = row.customer_email.trim()
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
      lastSeenAt: Number(row.created_at),
      bookingCount: 1,
    })

    if (recipients.size >= safeLimit) break
  }

  return Array.from(recipients.values())
}

export function getRepairBookingByRef(bookingRef: string): RepairBookingRecord | null {
  const database = getDb()
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return null

  const row = database
    .prepare(`
      SELECT
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
        customer_name,
        customer_phone,
        customer_email,
        company,
        issue_notes,
        inspection_notes,
        quote_line_items,
        quote_generated_at
      FROM repair_bookings
      WHERE booking_ref = ?
      LIMIT 1
    `)
    .get(normalizedRef) as
    | {
        id: number
        booking_ref: string
        status: string
        created_at: number
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
        customer_name: string
        customer_phone: string
        customer_email: string
        company: string | null
        issue_notes: string | null
        inspection_notes: string | null
        quote_line_items: string | null
        quote_generated_at: number | null
      }
    | undefined

  if (!row) return null
  return mapRepairBookingRow(row)
}

function normalizeBookingStatus(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
}

const ALLOWED_BOOKING_STATUSES = new Set([
  "new",
  "in_progress",
  "quote_sent",
  "awaiting_customer",
  "booked_in",
  "completed",
  "cancelled",
])

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

export function updateRepairBooking(
  bookingRef: string,
  updates: UpdateRepairBookingInput
): UpdateRepairBookingResult {
  const database = getDb()
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return { ok: false, reason: "not_found" }

  const existingBooking = getRepairBookingByRef(normalizedRef)
  if (!existingBooking) return { ok: false, reason: "not_found" }

  const setClauses: string[] = []
  const values: Array<string | number | null> = []

  if (typeof updates.status === "string") {
    const normalizedStatus = normalizeBookingStatus(updates.status)
    if (!ALLOWED_BOOKING_STATUSES.has(normalizedStatus)) {
      return { ok: false, reason: "invalid_status" }
    }

    setClauses.push("status = ?")
    values.push(normalizedStatus)
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
    setClauses.push("service_name = ?")
    values.push(combineServiceNames(nextCustomerServiceName, nextInspectionServiceName))

    setClauses.push("customer_service_name = ?")
    values.push(nextCustomerServiceName)

    setClauses.push("inspection_service_name = ?")
    values.push(nextInspectionServiceName)
  }

  if (updates.estimatedCost !== undefined) {
    setClauses.push("estimated_cost = ?")
    values.push(normalizeOptionalText(updates.estimatedCost, 120))
  }

  if (updates.estimatedTime !== undefined) {
    setClauses.push("estimated_time = ?")
    values.push(normalizeOptionalText(updates.estimatedTime, 120))
  }

  if (updates.issueNotes !== undefined) {
    setClauses.push("issue_notes = ?")
    values.push(normalizeOptionalText(updates.issueNotes, 5000))
  }

  if (updates.inspectionNotes !== undefined) {
    setClauses.push("inspection_notes = ?")
    values.push(normalizeOptionalText(updates.inspectionNotes, 5000))
  }

  if (updates.quoteLineItems !== undefined) {
    setClauses.push("quote_line_items = ?")
    values.push(normalizeOptionalText(updates.quoteLineItems, 20000))
  }

  if (updates.quoteGeneratedAt !== undefined) {
    setClauses.push("quote_generated_at = ?")
    values.push(normalizeOptionalTimestamp(updates.quoteGeneratedAt))
  }

  if (setClauses.length === 0) {
    return { ok: false, reason: "no_changes" }
  }

  const updateResult = database
    .prepare(`
      UPDATE repair_bookings
      SET ${setClauses.join(", ")}
      WHERE booking_ref = ?
    `)
    .run(...values, normalizedRef) as { changes?: number | bigint }

  const rawChanges = updateResult.changes ?? 0
  const changes =
    typeof rawChanges === "bigint" ? Number(rawChanges) : Number(rawChanges)
  if (!Number.isFinite(changes) || changes < 1) {
    return { ok: false, reason: "not_found" }
  }

  const updated = getRepairBookingByRef(normalizedRef)
  if (!updated) return { ok: false, reason: "not_found" }

  return { ok: true, booking: updated }
}

export function updateRepairBookingStatus(
  bookingRef: string,
  status: string
): UpdateRepairBookingStatusResult {
  const result = updateRepairBooking(bookingRef, { status })
  if (!result.ok) {
    if (result.reason === "invalid_status") {
      return { ok: false, reason: "invalid_status" }
    }
    return { ok: false, reason: "not_found" }
  }

  return result
}

function normalizeIdempotencyKey(key: string) {
  return key.trim().slice(0, 160)
}

export function reserveBookingSubmissionIdempotencyKey(
  idempotencyKey: string
): BookingSubmissionIdempotencyState {
  const database = getDb()
  const normalizedKey = normalizeIdempotencyKey(idempotencyKey)
  if (!normalizedKey) return { status: "acquired" }

  const now = Date.now()
  const inserted = database
    .prepare(`
      INSERT INTO booking_submission_idempotency (
        idempotency_key,
        booking_ref,
        created_at,
        updated_at
      ) VALUES (?, NULL, ?, ?)
      ON CONFLICT(idempotency_key) DO NOTHING
    `)
    .run(normalizedKey, now, now) as { changes?: number | bigint }

  const rawChanges = inserted.changes ?? 0
  const changes =
    typeof rawChanges === "bigint" ? Number(rawChanges) : Number(rawChanges)
  if (Number.isFinite(changes) && changes > 0) {
    return { status: "acquired" }
  }

  const existing = database
    .prepare(`
      SELECT booking_ref
      FROM booking_submission_idempotency
      WHERE idempotency_key = ?
      LIMIT 1
    `)
    .get(normalizedKey) as { booking_ref: string | null } | undefined

  if (existing?.booking_ref) {
    return {
      status: "replay",
      bookingRef: existing.booking_ref,
    }
  }

  return { status: "in_progress" }
}

export function completeBookingSubmissionIdempotencyKey(
  idempotencyKey: string,
  bookingRef: string
) {
  const database = getDb()
  const normalizedKey = normalizeIdempotencyKey(idempotencyKey)
  if (!normalizedKey) return

  const now = Date.now()
  database
    .prepare(`
      UPDATE booking_submission_idempotency
      SET booking_ref = ?, updated_at = ?
      WHERE idempotency_key = ?
    `)
    .run(bookingRef.trim(), now, normalizedKey)
}

export function releaseBookingSubmissionIdempotencyKey(idempotencyKey: string) {
  const database = getDb()
  const normalizedKey = normalizeIdempotencyKey(idempotencyKey)
  if (!normalizedKey) return

  database
    .prepare(`
      DELETE FROM booking_submission_idempotency
      WHERE idempotency_key = ?
        AND booking_ref IS NULL
    `)
    .run(normalizedKey)
}

function mapOwnerNotificationRow(row: {
  booking_ref: string
  status: string
  attempts: number
  resend_message_id: string | null
  last_error: string | null
  last_attempt_at: number | null
  sent_at: number | null
  created_at: number
  updated_at: number
}): BookingOwnerNotificationRecord {
  return {
    bookingRef: row.booking_ref,
    status:
      row.status === "sent"
        ? "sent"
        : row.status === "failed"
          ? "failed"
          : "pending",
    attempts: Number(row.attempts),
    resendMessageId: row.resend_message_id,
    lastError: row.last_error,
    lastAttemptAt:
      row.last_attempt_at === null ? null : Number(row.last_attempt_at),
    sentAt: row.sent_at === null ? null : Number(row.sent_at),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  }
}

export function enqueueBookingOwnerNotification(bookingRef: string) {
  const database = getDb()
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return

  const now = Date.now()
  database
    .prepare(`
      INSERT INTO booking_owner_notifications (
        booking_ref,
        status,
        attempts,
        resend_message_id,
        last_error,
        last_attempt_at,
        sent_at,
        created_at,
        updated_at
      ) VALUES (?, 'pending', 0, NULL, NULL, NULL, NULL, ?, ?)
      ON CONFLICT(booking_ref) DO NOTHING
    `)
    .run(normalizedRef, now, now)
}

export function getBookingOwnerNotificationByRef(
  bookingRef: string
): BookingOwnerNotificationRecord | null {
  const database = getDb()
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return null

  const row = database
    .prepare(`
      SELECT
        booking_ref,
        status,
        attempts,
        resend_message_id,
        last_error,
        last_attempt_at,
        sent_at,
        created_at,
        updated_at
      FROM booking_owner_notifications
      WHERE booking_ref = ?
      LIMIT 1
    `)
    .get(normalizedRef) as
    | {
        booking_ref: string
        status: string
        attempts: number
        resend_message_id: string | null
        last_error: string | null
        last_attempt_at: number | null
        sent_at: number | null
        created_at: number
        updated_at: number
      }
    | undefined

  if (!row) return null
  return mapOwnerNotificationRow(row)
}

export function listRetryableBookingOwnerNotifications(
  limit = 10,
  maxAttempts = 8
): BookingOwnerNotificationRecord[] {
  const database = getDb()
  const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 10)))
  const safeMaxAttempts = Math.max(
    1,
    Math.min(100, Math.floor(Number(maxAttempts) || 8))
  )

  const rows = database
    .prepare(`
      SELECT
        booking_ref,
        status,
        attempts,
        resend_message_id,
        last_error,
        last_attempt_at,
        sent_at,
        created_at,
        updated_at
      FROM booking_owner_notifications
      WHERE status != 'sent'
        AND attempts < ?
      ORDER BY
        COALESCE(last_attempt_at, 0) ASC,
        created_at ASC
      LIMIT ?
    `)
    .all(safeMaxAttempts, safeLimit) as Array<{
    booking_ref: string
    status: string
    attempts: number
    resend_message_id: string | null
    last_error: string | null
    last_attempt_at: number | null
    sent_at: number | null
    created_at: number
    updated_at: number
  }>

  return rows.map(mapOwnerNotificationRow)
}

export function recordBookingOwnerNotificationSent(
  bookingRef: string,
  resendMessageId: string | null
) {
  const database = getDb()
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return

  const now = Date.now()
  database
    .prepare(`
      UPDATE booking_owner_notifications
      SET
        status = 'sent',
        attempts = attempts + 1,
        resend_message_id = ?,
        last_error = NULL,
        last_attempt_at = ?,
        sent_at = ?,
        updated_at = ?
      WHERE booking_ref = ?
    `)
    .run(resendMessageId, now, now, now, normalizedRef)
}

export function recordBookingOwnerNotificationFailure(
  bookingRef: string,
  errorMessage: string
) {
  const database = getDb()
  const normalizedRef = bookingRef.trim()
  if (!normalizedRef) return

  const now = Date.now()
  const safeError = errorMessage.trim().slice(0, 2000)
  database
    .prepare(`
      UPDATE booking_owner_notifications
      SET
        status = 'failed',
        attempts = attempts + 1,
        last_error = ?,
        last_attempt_at = ?,
        updated_at = ?
      WHERE booking_ref = ?
    `)
    .run(safeError || "Email send failed", now, now, normalizedRef)
}
