export type BookingRecord = {
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

export type BookingStatus =
  | "new"
  | "in_progress"
  | "quote_sent"
  | "awaiting_customer"
  | "booked_in"
  | "completed"
  | "cancelled"

export type SourceFilter = "all" | "quotes" | "bookings"

export const STATUS_OPTIONS: Array<{ value: BookingStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "quote_sent", label: "Quote Sent" },
  { value: "awaiting_customer", label: "Awaiting Customer" },
  { value: "booked_in", label: "Booked In" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export const STATUS_PIPELINE: BookingStatus[] = [
  "new",
  "in_progress",
  "quote_sent",
  "awaiting_customer",
  "booked_in",
  "completed",
]

export const STATUS_LABEL: Record<BookingStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  quote_sent: "Quote Sent",
  awaiting_customer: "Awaiting Customer",
  booked_in: "Booked In",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const STATUS_BADGE_CLASS: Record<BookingStatus, string> = {
  new: "border-zinc-300 bg-zinc-100 text-zinc-700",
  in_progress: "border-amber-300 bg-amber-100 text-amber-800",
  quote_sent: "border-stone-300 bg-stone-100 text-stone-800",
  awaiting_customer: "border-orange-300 bg-orange-100 text-orange-800",
  booked_in: "border-neutral-300 bg-neutral-100 text-neutral-800",
  completed: "border-zinc-900 bg-zinc-900 text-white",
  cancelled: "border-rose-300 bg-rose-100 text-rose-700",
}

export function asStatus(value: string): BookingStatus | null {
  return STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as BookingStatus)
    : null
}

export function displayText(
  value: string | null | undefined,
  fallback = "Not provided"
) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

export function formatDateTime(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "Unknown"
  return new Date(timestamp).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function formatShortDate(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "Unknown"
  return new Date(timestamp).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

export function formatAppointment(date: string, time: string) {
  const parsed = new Date(date)
  const readableDate = Number.isNaN(parsed.getTime())
    ? displayText(date)
    : parsed.toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })

  return `${readableDate} • ${displayText(time)}`
}

export function formatIssueList(serviceName: string | null) {
  if (!serviceName?.trim()) return []
  return serviceName
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function isQuoteRequest(booking: BookingRecord) {
  const location = booking.storeLocation.toLowerCase()
  const time = booking.appointmentTime.toLowerCase()
  return location.includes("quote") || time.includes("quote")
}

export function getSourceLabel(booking: BookingRecord) {
  return isQuoteRequest(booking) ? "Quote" : "Booking"
}

export function getSourcePillClass(booking: BookingRecord) {
  return isQuoteRequest(booking)
    ? "border-zinc-300 bg-zinc-100 text-zinc-700"
    : "border-zinc-300 bg-zinc-50 text-zinc-700"
}

export function toPhoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "")
  return normalized ? `tel:${normalized}` : ""
}

export function toDayKey(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return ""
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getNextWorkflowStatus(currentStatus: BookingStatus) {
  const index = STATUS_PIPELINE.indexOf(currentStatus)
  if (index < 0 || index >= STATUS_PIPELINE.length - 1) return null
  return STATUS_PIPELINE[index + 1]
}

export function getPreviousWorkflowStatus(currentStatus: BookingStatus) {
  const index = STATUS_PIPELINE.indexOf(currentStatus)
  if (index <= 0) return null
  return STATUS_PIPELINE[index - 1]
}

export function getPipelineProgress(status: BookingStatus) {
  const index = STATUS_PIPELINE.indexOf(status)
  if (index < 0) return 0
  return ((index + 1) / STATUS_PIPELINE.length) * 100
}

export function getStatusCounts(bookings: BookingRecord[]) {
  const counts: Record<BookingStatus, number> = {
    new: 0,
    in_progress: 0,
    quote_sent: 0,
    awaiting_customer: 0,
    booked_in: 0,
    completed: 0,
    cancelled: 0,
  }

  for (const booking of bookings) {
    const status = asStatus(booking.status)
    if (status) counts[status] += 1
  }

  return counts
}

function csvCell(value: string) {
  const escaped = value.replaceAll('"', '""')
  return `"${escaped}"`
}

function buildBookingsCsv(bookings: BookingRecord[]) {
  const headers = [
    "Booking Ref",
    "Source",
    "Status",
    "Created At",
    "Customer Name",
    "Phone",
    "Email",
    "Device",
    "Customer Requested Services",
    "Added During Inspection",
    "All Services",
    "Appointment",
    "Store Location",
    "Customer Notes",
    "Inspection Notes (Staff only)",
    "Quote Generated At",
    "Quote Line Items (JSON)",
  ]

  const rows = bookings.map((booking) => [
    booking.bookingRef,
    getSourceLabel(booking),
    STATUS_LABEL[asStatus(booking.status) || "new"],
    formatDateTime(booking.createdAt),
    displayText(booking.customerName),
    displayText(booking.customerPhone),
    displayText(booking.customerEmail),
    `${displayText(booking.brandName)} ${displayText(booking.modelName, "")}`.trim(),
    formatIssueList(booking.customerServiceName).join(" | "),
    formatIssueList(booking.inspectionServiceName).join(" | "),
    formatIssueList(booking.serviceName).join(" | "),
    formatAppointment(booking.appointmentDate, booking.appointmentTime),
    displayText(booking.storeLocation),
    displayText(booking.issueNotes, ""),
    displayText(booking.inspectionNotes, ""),
    booking.quoteGeneratedAt ? formatDateTime(booking.quoteGeneratedAt) : "",
    displayText(booking.quoteLineItems, ""),
  ])

  return [
    headers.map((header) => csvCell(header)).join(","),
    ...rows.map((row) => row.map((cell) => csvCell(cell)).join(",")),
  ].join("\n")
}

export function downloadBookingsCsv(bookings: BookingRecord[], filenamePrefix: string) {
  if (bookings.length === 0) return false
  if (typeof window === "undefined") return false

  const csv = buildBookingsCsv(bookings)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}
