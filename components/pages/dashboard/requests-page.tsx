"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Copy,
  Download,
  FileText,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Sparkles,
  Store,
  UserRound,
  Wrench,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useDashboardData } from "./dashboard-data-context"
import type {
  BookingRecord,
  BookingStatus,
  SourceFilter,
} from "./dashboard-utils"
import {
  asStatus,
  displayText,
  formatAppointment,
  formatDateTime,
  formatIssueList,
  formatShortDate,
  getNextWorkflowStatus,
  getPipelineProgress,
  getPreviousWorkflowStatus,
  getSourceLabel,
  getSourcePillClass,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  STATUS_OPTIONS,
  STATUS_PIPELINE,
  toPhoneHref,
} from "./dashboard-utils"

type RequestViewMode = "queue" | "flow"
type DateRangeFilter = "all" | "today" | "week"

const FLOW_DISPLAY_STATUSES: BookingStatus[] = [...STATUS_PIPELINE, "cancelled"]

const INSPECTION_SERVICE_PRESETS = [
  "Diagnostics",
  "Battery Replacement",
  "Charging Port Repair",
  "Back Glass Repair",
  "Speaker Repair",
  "Water Damage Cleanup",
]

const PHONE_GARAGE_LOGO_URL = "https://www.phonegarage.com.au/headerTop.png"

function formatRelativeAge(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "Unknown"

  const diffMs = Date.now() - timestamp
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getRecommendedAction(status: BookingStatus) {
  switch (status) {
    case "new":
      return "Review issue and contact customer"
    case "in_progress":
      return "Run diagnostics and prepare quote"
    case "quote_sent":
      return "Follow up for customer confirmation"
    case "awaiting_customer":
      return "Schedule reminder and check response"
    case "booked_in":
      return "Prepare parts and technician slot"
    case "completed":
      return "Confirm pickup and close case"
    case "cancelled":
      return "Archive or reopen if customer returns"
    default:
      return "Update workflow status"
  }
}

function normalizeServiceLabel(value: string) {
  return value.trim().replace(/\s+/g, " ")
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

function parseQuoteAmount(value: string) {
  const normalized = value.replace(/[^\d.]/g, "")
  if (!normalized) return null

  const numeric = Number(normalized)
  if (!Number.isFinite(numeric) || numeric < 0) return null
  return numeric
}

function formatQuoteDate(value: Date) {
  return value.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function buildQuoteServices(
  customerRequestedServices: string[],
  inspectionAddedServices: string[]
) {
  const deduped = new Set<string>()
  const combined: string[] = []

  for (const service of [...customerRequestedServices, ...inspectionAddedServices]) {
    const normalized = service.trim()
    if (!normalized) continue
    const key = normalized.toLowerCase()
    if (deduped.has(key)) continue
    deduped.add(key)
    combined.push(normalized)
  }

  return combined
}

type QuoteSendRow = {
  service: string
  parsedAmount: number | null
}

type SavedQuoteLineItem = {
  service: string
  amount: string
}

function parseSavedQuoteLineItems(value: string | null | undefined) {
  if (!value?.trim()) return [] as SavedQuoteLineItem[]

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return [] as SavedQuoteLineItem[]

    const items: SavedQuoteLineItem[] = []
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue

      const candidate = item as { service?: unknown; amount?: unknown }
      const service =
        typeof candidate.service === "string"
          ? normalizeServiceLabel(candidate.service)
          : ""
      if (!service) continue

      let amount = ""
      if (typeof candidate.amount === "number" && Number.isFinite(candidate.amount)) {
        amount = candidate.amount.toFixed(2)
      } else if (typeof candidate.amount === "string") {
        amount = candidate.amount.trim()
      }

      items.push({ service, amount })
    }

    return items
  } catch {
    return [] as SavedQuoteLineItem[]
  }
}

function toSmsPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "")
}

function toWhatsAppPhone(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("0")) return `61${digits.slice(1)}`
  return digits
}

function toAsciiText(value: string) {
  return value.replace(/[^\x20-\x7E]/g, " ")
}

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)")
}

function wrapTextLine(value: string, maxLength = 86) {
  const normalized = value.replace(/\s+/g, " ").trim()
  if (!normalized) return [""]

  const words = normalized.split(" ")
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxLength) {
      current = next
      continue
    }

    if (current) lines.push(current)
    if (word.length > maxLength) {
      lines.push(word.slice(0, maxLength))
      current = word.slice(maxLength)
    } else {
      current = word
    }
  }

  if (current) lines.push(current)
  return lines
}

type PdfColor = [number, number, number]

function pdfColor(value: PdfColor) {
  return `${value[0].toFixed(3)} ${value[1].toFixed(3)} ${value[2].toFixed(3)}`
}

function estimatePdfTextWidth(value: string, fontSize: number) {
  return toAsciiText(value).length * fontSize * 0.52
}

function pushPdfRect(
  ops: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: PdfColor
) {
  ops.push(`${pdfColor(color)} rg`)
  ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`)
}

function pushPdfStrokeRect(
  ops: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: PdfColor,
  lineWidth = 1
) {
  ops.push(`${pdfColor(color)} RG`)
  ops.push(`${lineWidth.toFixed(2)} w`)
  ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`)
}

function pushPdfLine(
  ops: string[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: PdfColor,
  lineWidth = 1
) {
  ops.push(`${pdfColor(color)} RG`)
  ops.push(`${lineWidth.toFixed(2)} w`)
  ops.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`)
}

function pushPdfText(
  ops: string[],
  text: string,
  x: number,
  y: number,
  options?: {
    font?: "F1" | "F2"
    fontSize?: number
    color?: PdfColor
    align?: "left" | "right"
  }
) {
  const font = options?.font || "F1"
  const fontSize = options?.fontSize || 11
  const color = options?.color || [0, 0, 0]
  const align = options?.align || "left"
  const safeText = escapePdfText(toAsciiText(text))
  const textX =
    align === "right"
      ? x - estimatePdfTextWidth(safeText, fontSize)
      : x

  ops.push("BT")
  ops.push(`${pdfColor(color)} rg`)
  ops.push(`/${font} ${fontSize} Tf`)
  ops.push(`${textX.toFixed(2)} ${y.toFixed(2)} Td`)
  ops.push(`(${safeText}) Tj`)
  ops.push("ET")
}

function createQuotePdfBlob(
  booking: BookingRecord,
  rows: QuoteSendRow[],
  total: number,
  issuedAt: Date
) {
  const pageWidth = 595
  const pageHeight = 842
  const validUntil = new Date(issuedAt)
  validUntil.setDate(validUntil.getDate() + 7)

  const lineItems = rows.length > 0 ? rows : [{ service: "General repair service", parsedAmount: total }]
  const tableRows: Array<{ service: string; amount: string }> = []

  for (const item of lineItems) {
    const amount =
      item.parsedAmount === null
        ? "TBC"
        : formatQuoteAmount(item.parsedAmount.toFixed(2))
    const serviceLines = wrapTextLine(normalizeServiceLabel(item.service), 46)
    serviceLines.forEach((line, index) => {
      tableRows.push({
        service: line,
        amount: index === 0 ? amount : "",
      })
    })
  }

  const maxTableRows = 10
  if (tableRows.length > maxTableRows) {
    const hidden = tableRows.length - maxTableRows + 1
    tableRows.splice(maxTableRows - 1)
    tableRows.push({
      service: `...and ${hidden} more line item${hidden === 1 ? "" : "s"}`,
      amount: "",
    })
  }

  const ops: string[] = []
  pushPdfRect(ops, 0, 0, pageWidth, pageHeight, [1, 1, 1])
  pushPdfLine(ops, 40, 824, 555, 824, [0.15, 0.21, 0.30], 2)

  pushPdfText(ops, "PHONE GARAGE", 40, 795, {
    font: "F2",
    fontSize: 23,
    color: [0.12, 0.16, 0.24],
  })
  pushPdfText(ops, "Service Quote", 40, 774, {
    font: "F1",
    fontSize: 11,
    color: [0.35, 0.39, 0.47],
  })
  pushPdfText(ops, "27 Church St, Lidcombe NSW 2141 | 0403983009 | phonegarage.com.au", 40, 759, {
    font: "F1",
    fontSize: 9,
    color: [0.46, 0.49, 0.56],
  })

  pushPdfText(ops, "Quote Ref", 555, 796, {
    font: "F1",
    fontSize: 9,
    color: [0.42, 0.46, 0.53],
    align: "right",
  })
  pushPdfText(ops, booking.bookingRef, 555, 779, {
    font: "F2",
    fontSize: 13,
    color: [0.12, 0.16, 0.24],
    align: "right",
  })
  pushPdfText(ops, `Issued ${formatQuoteDate(issuedAt)}`, 555, 764, {
    font: "F1",
    fontSize: 9,
    color: [0.42, 0.46, 0.53],
    align: "right",
  })
  pushPdfText(ops, `Valid until ${formatQuoteDate(validUntil)}`, 555, 750, {
    font: "F1",
    fontSize: 9,
    color: [0.42, 0.46, 0.53],
    align: "right",
  })

  pushPdfLine(ops, 40, 736, 555, 736, [0.86, 0.88, 0.92], 1)

  pushPdfLine(ops, 295, 612, 295, 708, [0.90, 0.92, 0.95], 1)
  pushPdfText(ops, "Customer", 40, 703, {
    font: "F2",
    fontSize: 10,
    color: [0.42, 0.46, 0.53],
  })
  pushPdfLine(ops, 40, 698, 280, 698, [0.88, 0.90, 0.94], 1)
  pushPdfText(ops, displayText(booking.customerName), 40, 678, {
    font: "F2",
    fontSize: 13,
    color: [0.12, 0.16, 0.24],
  })
  pushPdfText(ops, displayText(booking.customerEmail), 40, 660, {
    font: "F1",
    fontSize: 10,
    color: [0.23, 0.28, 0.35],
  })
  pushPdfText(ops, displayText(booking.customerPhone), 40, 644, {
    font: "F1",
    fontSize: 10,
    color: [0.23, 0.28, 0.35],
  })

  pushPdfText(ops, "Device Summary", 307, 703, {
    font: "F2",
    fontSize: 10,
    color: [0.42, 0.46, 0.53],
  })
  pushPdfLine(ops, 307, 698, 555, 698, [0.88, 0.90, 0.94], 1)
  pushPdfText(
    ops,
    `${displayText(booking.brandName)} ${displayText(booking.modelName, "")}`.trim(),
    307,
    678,
    { font: "F2", fontSize: 13, color: [0.12, 0.16, 0.24] }
  )
  pushPdfText(ops, `Status: ${STATUS_LABEL[asStatus(booking.status) || "new"]}`, 307, 660, {
    font: "F1",
    fontSize: 10,
    color: [0.23, 0.28, 0.35],
  })
  pushPdfText(ops, `Booking: ${booking.bookingRef}`, 307, 644, {
    font: "F1",
    fontSize: 10,
    color: [0.23, 0.28, 0.35],
  })

  const tableX = 40
  const tableY = 296
  const tableW = 515
  const tableH = 260
  const tableHeaderHeight = 30
  const priceDividerX = 430
  const tableBodyTop = tableY + tableH - tableHeaderHeight
  const rowHeight = 20

  pushPdfRect(ops, tableX, tableY, tableW, tableH, [1, 1, 1])
  pushPdfStrokeRect(ops, tableX, tableY, tableW, tableH, [0.86, 0.88, 0.92], 1)
  pushPdfRect(ops, tableX, tableBodyTop, tableW, tableHeaderHeight, [0.967, 0.972, 0.980])
  pushPdfLine(ops, priceDividerX, tableY, priceDividerX, tableY + tableH, [0.88, 0.90, 0.94], 1)

  pushPdfText(ops, "Service Breakdown", tableX + 12, tableBodyTop + 10, {
    font: "F2",
    fontSize: 10,
    color: [0.30, 0.35, 0.43],
  })
  pushPdfText(ops, "Price", tableX + tableW - 14, tableBodyTop + 10, {
    font: "F2",
    fontSize: 10,
    color: [0.30, 0.35, 0.43],
    align: "right",
  })

  tableRows.forEach((row, index) => {
    const rowTop = tableBodyTop - index * rowHeight
    const rowBottom = rowTop - rowHeight
    if (index % 2 === 0) {
      pushPdfRect(ops, tableX + 1, rowBottom + 1, tableW - 2, rowHeight - 1, [0.990, 0.992, 0.995])
    }

    pushPdfText(ops, row.service, tableX + 12, rowBottom + 6, {
      font: "F1",
      fontSize: 10,
      color: [0.13, 0.17, 0.24],
    })

    if (row.amount) {
      pushPdfText(ops, row.amount, tableX + tableW - 14, rowBottom + 6, {
        font: "F2",
        fontSize: 10,
        color: [0.13, 0.17, 0.24],
        align: "right",
      })
    }
  })

  pushPdfRect(ops, 40, 225, 515, 52, [1, 1, 1])
  pushPdfStrokeRect(ops, 40, 225, 515, 52, [0.80, 0.84, 0.91], 1.4)
  pushPdfText(ops, "Total Quote (AUD)", 52, 257, {
    font: "F2",
    fontSize: 10,
    color: [0.27, 0.33, 0.43],
  })
  pushPdfText(ops, formatQuoteAmount(total.toFixed(2)), 545, 236, {
    font: "F2",
    fontSize: 24,
    color: [0.12, 0.16, 0.24],
    align: "right",
  })

  pushPdfLine(ops, 40, 200, 555, 200, [0.88, 0.90, 0.94], 1)
  pushPdfText(ops, "Questions? Reply to this email or call 0403983009.", 40, 184, {
    font: "F1",
    fontSize: 10,
    color: [0.36, 0.40, 0.47],
  })
  pushPdfText(ops, "Thank you for choosing Phone Garage.", 40, 168, {
    font: "F1",
    fontSize: 10,
    color: [0.36, 0.40, 0.47],
  })

  const stream = ops.join("\n")
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
    `6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ]

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = [0]

  for (const object of objects) {
    offsets.push(pdf.length)
    pdf += object
  }

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: "application/pdf" })
}

function downloadQuotePdf(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function buildGmailComposeUrl(to: string, subject: string, body: string) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}

function buildQuoteChannelMessage(
  booking: BookingRecord,
  rows: QuoteSendRow[],
  total: number,
  channel: "sms" | "whatsapp" = "sms",
  issuedAtInput?: Date
) {
  const device = `${displayText(booking.brandName)} ${displayText(
    booking.modelName,
    ""
  )}`.trim()
  const issuedAt = issuedAtInput ?? new Date()
  const validUntil = new Date(issuedAt)
  validUntil.setDate(validUntil.getDate() + 7)

  const serviceLines = rows.map((row, index) => {
    const amount =
      row.parsedAmount === null
        ? "TBC"
        : formatQuoteAmount(row.parsedAmount.toFixed(2))
    return `${index + 1}. ${row.service}: ${amount}`
  })

  const title =
    channel === "whatsapp" ? "*PHONE GARAGE QUOTE TEMPLATE*" : "PHONE GARAGE QUOTE TEMPLATE"
  const serviceHeading =
    channel === "whatsapp" ? "*Service Breakdown:*" : "Service Breakdown:"
  const totalHeading =
    channel === "whatsapp" ? "*Total Quote:*" : "Total Quote:"

  return [
    title,
    `Reference: ${booking.bookingRef}`,
    `Customer: ${displayText(booking.customerName)}`,
    `Device: ${device}`,
    `Issued: ${formatQuoteDate(issuedAt)}`,
    `Valid Until: ${formatQuoteDate(validUntil)}`,
    "",
    serviceHeading,
    ...serviceLines,
    "",
    `${totalHeading} ${formatQuoteAmount(total.toFixed(2))}`,
    "",
    "Reply to confirm and we will proceed with repair.",
    "Phone Garage: 0403983009",
  ].join("\n")
}

export function DashboardRequestsPage() {
  const {
    bookings,
    loading,
    refreshing,
    updatingRef,
    autoRefresh,
    setAutoRefresh,
    setError,
    setActionMessage,
    loadBookings,
    updateBooking,
    updateStatus,
    exportBookingsCsv,
  } = useDashboardData()

  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all")
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("all")
  const [viewMode, setViewMode] = useState<RequestViewMode>("queue")
  const [selectedRef, setSelectedRef] = useState("")
  const [copiedRef, setCopiedRef] = useState("")
  const [inspectionServiceInput, setInspectionServiceInput] = useState("")
  const [inspectionNotesInput, setInspectionNotesInput] = useState("")
  const [servicePriceInputs, setServicePriceInputs] = useState<
    Record<string, string>
  >({})
  const [quoteBuilderOpen, setQuoteBuilderOpen] = useState(false)
  const [quoteTemplateVisible, setQuoteTemplateVisible] = useState(false)
  const [sendingEmailRef, setSendingEmailRef] = useState("")
  const hasActiveFilters =
    search.trim().length > 0 ||
    sourceFilter !== "all" ||
    statusFilter !== "all" ||
    dateFilter !== "all"

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const source = params.get("source")
    const status = params.get("status")
    const date = params.get("date")
    const ref = params.get("ref")
    const view = params.get("view")

    if (source === "quotes" || source === "bookings" || source === "all") {
      setSourceFilter(source)
    }

    if (
      status &&
      (status === "all" || STATUS_OPTIONS.some((item) => item.value === status))
    ) {
      setStatusFilter(status as "all" | BookingStatus)
    }

    if (date === "all" || date === "today" || date === "week") {
      setDateFilter(date)
    }

    if (view === "queue" || view === "flow") {
      setViewMode(view)
    }

    if (ref?.trim()) {
      setSelectedRef(ref.trim())
    }
  }, [])

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(startOfToday)
    endOfToday.setDate(endOfToday.getDate() + 1)
    const dayIndex = startOfToday.getDay()
    const daysSinceMonday = (dayIndex + 6) % 7
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    const startOfTodayMs = startOfToday.getTime()
    const endOfTodayMs = endOfToday.getTime()
    const startOfWeekMs = startOfWeek.getTime()
    const endOfWeekMs = endOfWeek.getTime()

    return bookings.filter((booking) => {
      const source = getSourceLabel(booking).toLowerCase()
      if (sourceFilter === "quotes" && source !== "quote") return false
      if (sourceFilter === "bookings" && source !== "booking") return false

      const status = asStatus(booking.status)
      if (statusFilter !== "all" && status !== statusFilter) return false

      if (dateFilter !== "all") {
        const createdAtMs = Number(booking.createdAt)
        if (!Number.isFinite(createdAtMs)) return false

        if (dateFilter === "today") {
          if (createdAtMs < startOfTodayMs || createdAtMs >= endOfTodayMs) return false
        }

        if (dateFilter === "week") {
          if (createdAtMs < startOfWeekMs || createdAtMs >= endOfWeekMs) return false
        }
      }

      if (!normalizedSearch) return true

      const haystack = [
        booking.bookingRef,
        booking.customerName,
        booking.customerPhone,
        booking.customerEmail,
        booking.brandName,
        booking.modelName,
        booking.serviceName,
        booking.customerServiceName,
        booking.inspectionServiceName,
        booking.storeLocation,
        booking.issueNotes,
        booking.inspectionNotes,
        booking.quoteLineItems,
      ]
        .map((value) => value?.toLowerCase() || "")
        .join(" ")

      return haystack.includes(normalizedSearch)
    })
  }, [bookings, search, sourceFilter, statusFilter, dateFilter])

  const filteredStatusCounts = useMemo(() => {
    const counts: Record<BookingStatus, number> = {
      new: 0,
      in_progress: 0,
      quote_sent: 0,
      awaiting_customer: 0,
      booked_in: 0,
      completed: 0,
      cancelled: 0,
    }

    for (const booking of filteredBookings) {
      const status = asStatus(booking.status) || "new"
      counts[status] += 1
    }

    return counts
  }, [filteredBookings])

  const flowColumns = useMemo(() => {
    const columns: Record<BookingStatus, BookingRecord[]> = {
      new: [],
      in_progress: [],
      quote_sent: [],
      awaiting_customer: [],
      booked_in: [],
      completed: [],
      cancelled: [],
    }

    for (const booking of filteredBookings) {
      const status = asStatus(booking.status) || "new"
      columns[status].push(booking)
    }

    return columns
  }, [filteredBookings])

  const selectedBooking = useMemo(() => {
    if (filteredBookings.length === 0) return null

    return (
      filteredBookings.find((booking) => booking.bookingRef === selectedRef) ||
      filteredBookings[0]
    )
  }, [filteredBookings, selectedRef])

  useEffect(() => {
    if (!selectedBooking) {
      if (selectedRef) setSelectedRef("")
      return
    }

    if (selectedBooking.bookingRef !== selectedRef) {
      setSelectedRef(selectedBooking.bookingRef)
    }
  }, [selectedBooking, selectedRef])

  useEffect(() => {
    setInspectionServiceInput("")
  }, [selectedBooking?.bookingRef])

  useEffect(() => {
    setInspectionNotesInput(selectedBooking?.inspectionNotes ?? "")
  }, [selectedBooking?.bookingRef, selectedBooking?.inspectionNotes])

  useEffect(() => {
    const savedLineItems = parseSavedQuoteLineItems(selectedBooking?.quoteLineItems)

    if (savedLineItems.length === 0) {
      setServicePriceInputs({})
      setQuoteBuilderOpen(false)
      setQuoteTemplateVisible(false)
      return
    }

    const nextInputs: Record<string, string> = {}
    for (const item of savedLineItems) {
      nextInputs[item.service] = item.amount
    }

    setServicePriceInputs(nextInputs)
    setQuoteBuilderOpen(false)
    setQuoteTemplateVisible(true)
  }, [selectedBooking?.bookingRef])

  function copyBookingRef(ref: string) {
    void navigator.clipboard
      .writeText(ref)
      .then(() => {
        setCopiedRef(ref)
        setActionMessage(`Copied ${ref}.`)
        window.setTimeout(() => {
          setCopiedRef((current) => (current === ref ? "" : current))
        }, 1600)
      })
      .catch(() => {
        setActionMessage("Could not copy reference.")
      })
  }

  function resetFilters() {
    setSearch("")
    setSourceFilter("all")
    setStatusFilter("all")
    setDateFilter("all")
    setActionMessage("Filters reset. Showing all requests.")
  }

  async function addInspectionService(rawService: string) {
    if (!selectedBooking) return

    const normalizedService = normalizeServiceLabel(rawService)
    if (!normalizedService) return

    const customerRequestedServices = formatIssueList(
      selectedBooking.customerServiceName ?? selectedBooking.serviceName
    )
    const existingInspectionServices = formatIssueList(
      selectedBooking.inspectionServiceName
    )
    const existingCombinedServices = [
      ...customerRequestedServices,
      ...existingInspectionServices,
    ]

    const alreadyAdded = existingCombinedServices.some(
      (service) => service.toLowerCase() === normalizedService.toLowerCase()
    )

    if (alreadyAdded) {
      setActionMessage(`"${normalizedService}" is already in this request.`)
      setInspectionServiceInput("")
      return
    }

    const nextInspectionServices = [
      ...existingInspectionServices,
      normalizedService,
    ]
    await updateBooking(
      selectedBooking.bookingRef,
      { inspectionServiceName: nextInspectionServices.join(", ") },
      `Added "${normalizedService}" to ${selectedBooking.bookingRef}.`
    )
    setInspectionServiceInput("")
  }

  async function removeInspectionService(serviceToRemove: string) {
    if (!selectedBooking) return

    const existingInspectionServices = formatIssueList(
      selectedBooking.inspectionServiceName
    )
    const nextInspectionServices = existingInspectionServices.filter(
      (service) => service.toLowerCase() !== serviceToRemove.toLowerCase()
    )

    if (nextInspectionServices.length === existingInspectionServices.length) return

    await updateBooking(
      selectedBooking.bookingRef,
      {
        inspectionServiceName:
          nextInspectionServices.length > 0
            ? nextInspectionServices.join(", ")
            : null,
      },
      `Removed "${serviceToRemove}" from ${selectedBooking.bookingRef}.`
    )
  }

  async function saveInspectionNotes() {
    if (!selectedBooking) return

    await updateBooking(
      selectedBooking.bookingRef,
      { inspectionNotes: inspectionNotesInput },
      `Saved inspection notes for ${selectedBooking.bookingRef}.`
    )
  }

  function openQuoteBuilder(services: string[]) {
    const quoteServices = services.length > 0 ? services : ["General repair service"]
    setServicePriceInputs((current) => {
      const next: Record<string, string> = { ...current }
      for (const service of quoteServices) {
        next[service] = next[service] ?? ""
      }
      return next
    })

    const hasSavedQuote = Boolean(selectedBooking?.quoteLineItems?.trim())
    setQuoteTemplateVisible((current) => current || hasSavedQuote)
    setQuoteBuilderOpen(true)
  }

  function updateServicePrice(service: string, value: string) {
    setServicePriceInputs((current) => ({
      ...current,
      [service]: value,
    }))
    setQuoteTemplateVisible(false)
  }

  async function generateServiceTemplate(services: string[]) {
    if (!selectedBooking) return

    const quoteServices = services.length > 0 ? services : ["General repair service"]
    const pricedServices = quoteServices.map((service) => {
      const rawPrice = servicePriceInputs[service] ?? ""
      return { service, amount: parseQuoteAmount(rawPrice) }
    })

    const hasMissingPrice = pricedServices.some((service) => service.amount === null)
    if (hasMissingPrice) {
      setError("Enter a valid price for each service before generating template.")
      return
    }

    const total = pricedServices.reduce(
      (sum, service) => sum + (service.amount ?? 0),
      0
    )
    const generatedAt = Date.now()
    const quoteLineItemsPayload = JSON.stringify(
      pricedServices.map((service) => ({
        service: normalizeServiceLabel(service.service),
        amount: Number((service.amount ?? 0).toFixed(2)),
      }))
    )

    setError("")
    await updateBooking(
      selectedBooking.bookingRef,
      {
        estimatedCost: total.toFixed(2),
        quoteLineItems: quoteLineItemsPayload,
        quoteGeneratedAt: generatedAt,
      },
      `Generated quote template for ${selectedBooking.bookingRef}.`
    )
    setServicePriceInputs((current) => {
      const normalized: Record<string, string> = {}
      for (const service of pricedServices) {
        const key = normalizeServiceLabel(service.service)
        normalized[key] = (service.amount ?? 0).toFixed(2)
      }
      return { ...current, ...normalized }
    })
    setQuoteTemplateVisible(true)
  }

  function markQuoteShared(quoteTotal: number, message?: string) {
    if (!selectedBooking) return

    void updateBooking(
      selectedBooking.bookingRef,
      {
        status: "quote_sent",
        estimatedCost: quoteTotal.toFixed(2),
      },
      message || `Quote marked as sent for ${selectedBooking.bookingRef}.`
    )
  }

  function downloadQuoteTemplatePdf(rows: QuoteSendRow[], quoteTotal: number) {
    if (!selectedBooking) return

    const hasMissingPrice = rows.some((row) => row.parsedAmount === null)
    if (hasMissingPrice) {
      setError("Generate the template with all service prices before downloading.")
      return
    }

    try {
      const issuedAt =
        selectedBooking.quoteGeneratedAt &&
        Number.isFinite(selectedBooking.quoteGeneratedAt)
          ? new Date(selectedBooking.quoteGeneratedAt)
          : new Date()

      const pdfBlob = createQuotePdfBlob(
        selectedBooking,
        rows,
        quoteTotal,
        issuedAt
      )
      const pdfFileName = `phone-garage-quote-${selectedBooking.bookingRef}.pdf`
      downloadQuotePdf(pdfBlob, pdfFileName)
      setError("")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to download quote PDF."
      setError(message)
    }
  }

  function sendQuoteByEmail(rows: QuoteSendRow[], quoteTotal: number) {
    if (!selectedBooking) return

    if (!selectedBooking.customerEmail.trim()) {
      setError("Customer email is required to send quote by email.")
      return
    }

    const hasMissingPrice = rows.some((row) => row.parsedAmount === null)
    if (hasMissingPrice) {
      setError("Generate the template with all service prices before sending.")
      return
    }

    setError("")
    setSendingEmailRef(selectedBooking.bookingRef)

    try {
      const issuedAt =
        selectedBooking.quoteGeneratedAt &&
        Number.isFinite(selectedBooking.quoteGeneratedAt)
          ? new Date(selectedBooking.quoteGeneratedAt)
          : new Date()

      const pdfBlob = createQuotePdfBlob(
        selectedBooking,
        rows,
        quoteTotal,
        issuedAt
      )
      const pdfFileName = `phone-garage-quote-${selectedBooking.bookingRef}.pdf`
      downloadQuotePdf(pdfBlob, pdfFileName)

      const subject = `Phone Garage Quote • ${selectedBooking.bookingRef}`
      const body = [
        `Hi ${displayText(selectedBooking.customerName)},`,
        "",
        `Please find your repair quote attached as PDF.`,
        `Reference: ${selectedBooking.bookingRef}`,
        `Total Quote: ${formatQuoteAmount(quoteTotal.toFixed(2))}`,
        "",
        `Attachment: ${pdfFileName}`,
        "Please attach the downloaded PDF before sending.",
        "",
        "Phone Garage",
        "0403983009",
      ].join("\n")

      const gmailUrl = buildGmailComposeUrl(
        selectedBooking.customerEmail.trim(),
        subject,
        body
      )

      const popup = window.open(gmailUrl, "_blank", "noopener,noreferrer")
      if (!popup) {
        setError("Popup blocked. Allow pop-ups to open Gmail in a new tab.")
        return
      }

      markQuoteShared(
        quoteTotal,
        `Opened Gmail and downloaded ${pdfFileName}. Attach the PDF and send.`
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to prepare Gmail email."
      setError(message)
    } finally {
      setSendingEmailRef("")
    }
  }

  function sendQuoteBySms(rows: QuoteSendRow[], quoteTotal: number) {
    if (!selectedBooking) return

    const phone = toSmsPhone(selectedBooking.customerPhone)
    if (!phone) {
      setError("Customer phone is required to send SMS.")
      return
    }

    const issuedAt =
      selectedBooking.quoteGeneratedAt && Number.isFinite(selectedBooking.quoteGeneratedAt)
        ? new Date(selectedBooking.quoteGeneratedAt)
        : undefined
    const message = buildQuoteChannelMessage(
      selectedBooking,
      rows,
      quoteTotal,
      "sms",
      issuedAt
    )
    const smsHref = `sms:${phone}?body=${encodeURIComponent(message)}`

    const popup = window.open(smsHref, "_blank", "noopener,noreferrer")
    if (!popup) {
      setError("Popup blocked. Allow pop-ups to open SMS in a new tab.")
      return
    }

    setError("")
    markQuoteShared(quoteTotal, "Opened SMS app with full quote template.")
  }

  function sendQuoteByWhatsApp(rows: QuoteSendRow[], quoteTotal: number) {
    if (!selectedBooking) return

    const phone = toWhatsAppPhone(selectedBooking.customerPhone)
    if (!phone) {
      setError("Customer phone is required to send WhatsApp message.")
      return
    }

    const issuedAt =
      selectedBooking.quoteGeneratedAt && Number.isFinite(selectedBooking.quoteGeneratedAt)
        ? new Date(selectedBooking.quoteGeneratedAt)
        : undefined
    const message = buildQuoteChannelMessage(
      selectedBooking,
      rows,
      quoteTotal,
      "whatsapp",
      issuedAt
    )
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    const popup = window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    if (!popup) {
      setError("Popup blocked. Allow pop-ups to open WhatsApp in a new tab.")
      return
    }

    setError("")
    markQuoteShared(quoteTotal, "Opened WhatsApp with full quote template.")
  }

  function renderRequestCard(booking: BookingRecord, compact = false) {
    const active = selectedBooking?.bookingRef === booking.bookingRef
    const status = asStatus(booking.status) || "new"
    const issues = formatIssueList(booking.serviceName)

    return (
      <button
        key={booking.bookingRef}
        type="button"
        onClick={() => setSelectedRef(booking.bookingRef)}
        className={cn(
          "w-full rounded-2xl border p-3 text-left transition",
          active
            ? "border-zinc-900 bg-zinc-900 text-white"
            : "border-zinc-300 bg-white hover:border-zinc-900",
          compact && "rounded-xl p-2.5"
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
              active
                ? "border-white/35 bg-white/10 text-white"
                : getSourcePillClass(booking)
            )}
          >
            {getSourceLabel(booking)}
          </span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
              active
                ? "border-white/35 bg-white/10 text-white"
                : STATUS_BADGE_CLASS[status]
            )}
          >
            {STATUS_LABEL[status]}
          </span>
          <span className={cn("text-sm", active ? "text-zinc-300" : "text-zinc-500")}>{booking.bookingRef}</span>
        </div>

        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={cn("truncate text-sm font-semibold", active ? "text-white" : "text-zinc-900")}>
              {displayText(booking.customerName)}
            </p>
            <p className={cn("truncate text-sm", active ? "text-zinc-300" : "text-zinc-600")}>
              {displayText(booking.brandName)} {displayText(booking.modelName, "")}
            </p>
          </div>
          <p className={cn("shrink-0 text-sm", active ? "text-zinc-300" : "text-zinc-500")}>
            {compact ? formatRelativeAge(booking.createdAt) : formatShortDate(booking.createdAt)}
          </p>
        </div>

        {issues.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {issues.slice(0, compact ? 1 : 2).map((issue) => (
              <span
                key={issue}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
                  active
                    ? "border-white/25 bg-white/10 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700"
                )}
              >
                {issue}
              </span>
            ))}
            {issues.length > (compact ? 1 : 2) ? (
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
                  active
                    ? "border-white/25 bg-white/10 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700"
                )}
              >
                +{issues.length - (compact ? 1 : 2)}
              </span>
            ) : null}
          </div>
        ) : null}
      </button>
    )
  }

  const leftPanelClass = viewMode === "flow" ? "xl:col-span-6" : "xl:col-span-5"
  const rightPanelClass = viewMode === "flow" ? "xl:col-span-6" : "xl:col-span-7"

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-zinc-300 bg-white/95 p-4 shadow-[0_22px_58px_-45px_rgba(0,0,0,0.72)]">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by reference, customer, phone, email or issue"
              className="h-11 rounded-xl border-zinc-300 bg-white pl-10 text-zinc-900 focus-visible:border-zinc-900 focus-visible:ring-zinc-900/15"
            />
          </div>

          <div className="flex h-11 items-center gap-1 rounded-xl border border-zinc-300 bg-zinc-50 p-1">
            {(["all", "quotes", "bookings"] as SourceFilter[]).map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => setSourceFilter(source)}
                className={cn(
                  "h-9 rounded-lg px-3 text-sm font-semibold uppercase tracking-[0.08em] transition",
                  sourceFilter === source
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-200"
                )}
              >
                {source}
              </button>
            ))}
          </div>

          <div className="flex h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3">
            <Wrench className="h-4 w-4 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | BookingStatus)
              }
              className="h-full min-w-[150px] bg-transparent text-sm font-medium text-zinc-900 outline-none"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3">
            <CalendarClock className="h-4 w-4 text-zinc-500" />
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as DateRangeFilter)}
              className="h-full min-w-[170px] bg-transparent text-sm font-medium text-zinc-900 outline-none"
            >
              <option value="all">All dates</option>
              <option value="today">Today's requests</option>
              <option value="week">This week</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => exportBookingsCsv(filteredBookings, "dashboard-requests")}
              className="h-11 rounded-xl border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadBookings(true)}
              disabled={refreshing}
              className={cn(
                "h-11 rounded-xl border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900",
                refreshing && "animate-pulse"
              )}
            >
              Refresh
            </Button>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="h-11 rounded-xl border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
              >
                Reset Filters
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-600">
          <p>
            Showing <strong className="text-zinc-900">{filteredBookings.length}</strong> of{" "}
            <strong className="text-zinc-900">{bookings.length}</strong> requests.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center gap-1 rounded-lg border border-zinc-300 bg-zinc-50 p-1">
              {(["queue", "flow"] as RequestViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "h-8 rounded-md px-3 text-sm font-semibold uppercase tracking-[0.08em] transition",
                    viewMode === mode
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "rounded-full border px-3 py-1 font-semibold transition",
                autoRefresh
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-zinc-100 text-zinc-700"
              )}
            >
              Auto refresh {autoRefresh ? "On" : "Off"}
            </button>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-zinc-300 bg-zinc-50 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600">
              Request Flow Stages
            </p>
            <p className="text-sm text-zinc-500">
              Click any stage to focus the queue quickly
            </p>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
            {FLOW_DISPLAY_STATUSES.map((status) => {
              const stageNumber = STATUS_PIPELINE.indexOf(status)
              const selected = statusFilter === status
              const count = filteredStatusCounts[status]

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left transition",
                    selected
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 bg-white hover:border-zinc-900"
                  )}
                >
                  <p className={cn("text-sm font-semibold uppercase tracking-[0.08em]", selected ? "text-zinc-300" : "text-zinc-500")}>
                    {stageNumber >= 0 ? `Stage ${stageNumber + 1}` : "Closed"}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">{STATUS_LABEL[status]}</p>
                  <p className={cn("text-sm", selected ? "text-zinc-300" : "text-zinc-500")}>
                    {count} request{count === 1 ? "" : "s"}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <article
          className={cn(
            leftPanelClass,
            "flex min-h-[360px] flex-col rounded-[24px] border border-zinc-300 bg-white/95 p-4 shadow-[0_22px_58px_-45px_rgba(0,0,0,0.72)] sm:p-5 xl:h-[72vh]"
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">
              {viewMode === "flow" ? "Flow Board" : "Request Queue"}
            </p>
            <p className="text-sm text-zinc-500">
              {loading ? "Loading" : `${filteredBookings.length} items`}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-1 items-center rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
              Loading customer requests...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-1 items-center rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
              No requests match these filters.
            </div>
          ) : viewMode === "queue" ? (
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredBookings.map((booking) => renderRequestCard(booking))}
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {FLOW_DISPLAY_STATUSES.map((status) => {
                  const items = flowColumns[status]
                  const maxVisible = 5

                  return (
                    <div
                      key={status}
                      className="rounded-xl border border-zinc-300 bg-zinc-50 p-2.5"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setStatusFilter(status)}
                          className="text-sm font-semibold text-zinc-900 hover:underline"
                        >
                          {STATUS_LABEL[status]}
                        </button>
                        <span className="rounded-md border border-zinc-300 bg-white px-2 py-0.5 text-sm font-semibold text-zinc-700">
                          {items.length}
                        </span>
                      </div>

                      {items.length === 0 ? (
                        <p className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-500">
                          No requests in this stage.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {items.slice(0, maxVisible).map((booking) =>
                            renderRequestCard(booking, true)
                          )}
                          {items.length > maxVisible ? (
                            <p className="text-center text-sm text-zinc-500">
                              +{items.length - maxVisible} more
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </article>

        <article
          className={cn(
            rightPanelClass,
            "flex min-h-[360px] flex-col rounded-[24px] border border-zinc-300 bg-white/95 p-4 shadow-[0_22px_58px_-45px_rgba(0,0,0,0.72)] sm:p-5 xl:h-[72vh]"
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {!selectedBooking ? (
              <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-600">
                Select a request from the queue to view full details.
              </div>
            ) : (
              (() => {
              const status = asStatus(selectedBooking.status) || "new"
              const previousStatus = getPreviousWorkflowStatus(status)
              const nextStatus = getNextWorkflowStatus(status)
              const customerRequestedServices = formatIssueList(
                selectedBooking.customerServiceName ?? selectedBooking.serviceName
              )
              const inspectionAddedServices = formatIssueList(
                selectedBooking.inspectionServiceName
              )
              const allServices = [
                ...customerRequestedServices,
                ...inspectionAddedServices,
              ]
              const quoteServices = buildQuoteServices(
                customerRequestedServices,
                inspectionAddedServices
              )
              const savedQuoteLineItems = parseSavedQuoteLineItems(
                selectedBooking.quoteLineItems
              )
              const quoteLineItemSet = new Set<string>()
              const quoteLineItems: string[] = []

              for (const saved of savedQuoteLineItems) {
                if (!quoteLineItemSet.has(saved.service.toLowerCase())) {
                  quoteLineItemSet.add(saved.service.toLowerCase())
                  quoteLineItems.push(saved.service)
                }
              }

              for (const service of quoteServices) {
                if (!quoteLineItemSet.has(service.toLowerCase())) {
                  quoteLineItemSet.add(service.toLowerCase())
                  quoteLineItems.push(service)
                }
              }

              if (quoteLineItems.length === 0) {
                quoteLineItems.push("General repair service")
              }

              const quoteRows = quoteLineItems.map((service) => {
                const savedItem = savedQuoteLineItems.find(
                  (item) => item.service.toLowerCase() === service.toLowerCase()
                )
                const rawPrice = servicePriceInputs[service] ?? savedItem?.amount ?? ""
                const parsedAmount = parseQuoteAmount(rawPrice)
                return {
                  service,
                  rawPrice,
                  parsedAmount,
                }
              })
              const phoneHref = toPhoneHref(selectedBooking.customerPhone)
              const pipelineProgress = getPipelineProgress(status)
              const activePipelineIndex = STATUS_PIPELINE.indexOf(status)
              const isUpdating = updatingRef === selectedBooking.bookingRef
              const isSendingEmail = sendingEmailRef === selectedBooking.bookingRef
              const recommendation = getRecommendedAction(status)
              const savedInspectionNotes = selectedBooking.inspectionNotes ?? ""
              const inspectionNotesDirty =
                inspectionNotesInput.trim() !== savedInspectionNotes.trim()
              const quotePreviewReady = quoteTemplateVisible
              const quoteActionsLocked =
                status === "completed" || status === "cancelled"
              const hasMissingQuotePrice = quoteRows.some(
                (row) => row.parsedAmount === null
              )
              const quoteTotal = quoteRows.reduce(
                (sum, row) => sum + (row.parsedAmount ?? 0),
                0
              )
              const canGenerateTemplate =
                quoteBuilderOpen &&
                !hasMissingQuotePrice &&
                !quoteActionsLocked &&
                !isUpdating
              const canSendQuote =
                quotePreviewReady &&
                !hasMissingQuotePrice &&
                !quoteActionsLocked &&
                !isUpdating
              const canSendEmail =
                canSendQuote &&
                !isSendingEmail &&
                Boolean(selectedBooking.customerEmail.trim())
              const canDownloadQuote = canSendQuote
              const canSendMessage = canSendQuote && Boolean(selectedBooking.customerPhone.trim())
              const quoteIssuedAt =
                selectedBooking.quoteGeneratedAt &&
                Number.isFinite(selectedBooking.quoteGeneratedAt)
                  ? new Date(selectedBooking.quoteGeneratedAt)
                  : new Date()
              const quoteValidUntil = new Date(quoteIssuedAt)
              quoteValidUntil.setDate(quoteValidUntil.getDate() + 7)
              const normalizedIssueNames = new Set(
                allServices.map((issue) => issue.toLowerCase())
              )

              return (
                <>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
                            getSourcePillClass(selectedBooking)
                          )}
                        >
                          {getSourceLabel(selectedBooking)}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
                            STATUS_BADGE_CLASS[status]
                          )}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </div>

                      <h2 className="mt-2 text-xl font-semibold text-zinc-900">
                        {displayText(selectedBooking.customerName)}
                      </h2>
                      <p className="text-sm text-zinc-500">
                        {selectedBooking.bookingRef} • {formatDateTime(selectedBooking.createdAt)}
                      </p>

                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-sm font-semibold text-zinc-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        {recommendation}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => copyBookingRef(selectedBooking.bookingRef)}
                        className="h-10 rounded-xl border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                      >
                        <Copy className="h-4 w-4" />
                        {copiedRef === selectedBooking.bookingRef ? "Copied" : "Copy Ref"}
                      </Button>

                      <div className="flex h-10 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3">
                        <label
                          htmlFor="request-status"
                          className="text-sm font-semibold uppercase tracking-[0.08em] text-zinc-500"
                        >
                          Status
                        </label>
                        <select
                          id="request-status"
                          value={status}
                          onChange={(event) =>
                            void updateStatus(
                              selectedBooking.bookingRef,
                              event.target.value as BookingStatus
                            )
                          }
                          disabled={isUpdating}
                          className="h-full bg-transparent text-sm font-semibold text-zinc-900 outline-none"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {status === "new" ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          void updateStatus(selectedBooking.bookingRef, "in_progress")
                        }
                        disabled={isUpdating}
                        className="h-10 rounded-xl border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                      >
                        <Wrench className="h-4 w-4" />
                        Start Inspection
                      </Button>
                    ) : null}

                    {previousStatus ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          void updateStatus(selectedBooking.bookingRef, previousStatus)
                        }
                        disabled={isUpdating}
                        className="h-10 rounded-xl border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Move to {STATUS_LABEL[previousStatus]}
                      </Button>
                    ) : null}

                    {nextStatus ? (
                      <Button
                        type="button"
                        onClick={() => void updateStatus(selectedBooking.bookingRef, nextStatus)}
                        disabled={isUpdating}
                        className="h-10 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
                      >
                        Move to {STATUS_LABEL[nextStatus]}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-2xl border border-zinc-300 bg-zinc-50 p-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600">
                      Workflow Progress
                    </p>

                    {status === "cancelled" ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                          <CircleX className="h-4 w-4" />
                          This request is marked as cancelled.
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void updateStatus(selectedBooking.bookingRef, "new")}
                          disabled={isUpdating}
                          className="h-10 rounded-xl border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                        >
                          Reopen as New
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className="h-full rounded-full bg-zinc-900 transition-all duration-300"
                            style={{ width: `${pipelineProgress}%` }}
                          />
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                          {STATUS_PIPELINE.map((step, index) => {
                            const reached = activePipelineIndex >= index
                            const active = status === step

                            return (
                              <button
                                key={step}
                                type="button"
                                onClick={() => void updateStatus(selectedBooking.bookingRef, step)}
                                disabled={isUpdating || active}
                                className={cn(
                                  "rounded-xl border px-2 py-2 text-center transition",
                                  reached
                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                    : "border-zinc-300 bg-white text-zinc-500",
                                  active && "ring-2 ring-zinc-900/20",
                                  !active && "hover:border-zinc-900"
                                )}
                              >
                                <p className="text-xs font-semibold uppercase tracking-[0.08em]">
                                  {STATUS_LABEL[step]}
                                </p>
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <a
                      href={phoneHref || undefined}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm font-semibold text-zinc-900",
                        phoneHref
                          ? "hover:border-zinc-900 hover:bg-white"
                          : "pointer-events-none opacity-60"
                      )}
                    >
                      <Phone className="h-4 w-4" />
                      {displayText(selectedBooking.customerPhone)}
                    </a>

                    {selectedBooking.customerEmail.trim() ? (
                      <a
                        href={`mailto:${selectedBooking.customerEmail}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm font-semibold text-zinc-900 hover:border-zinc-900 hover:bg-white"
                      >
                        <Mail className="h-4 w-4" />
                        {selectedBooking.customerEmail}
                      </a>
                    ) : (
                      <p className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-500">
                        <Mail className="h-4 w-4" />
                        Email not provided
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-300 bg-white p-3">
                      <div className="flex items-start gap-2">
                        <UserRound className="mt-0.5 h-4 w-4 text-zinc-500" />
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600">
                            Customer
                          </p>
                          <p className="mt-1 text-sm text-zinc-900">
                            {displayText(selectedBooking.customerName)}
                          </p>
                          <p className="text-sm text-zinc-700">
                            {displayText(selectedBooking.company, "Personal booking")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-300 bg-white p-3">
                      <div className="flex items-start gap-2">
                        <CalendarClock className="mt-0.5 h-4 w-4 text-zinc-500" />
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600">
                            Appointment
                          </p>
                          <p className="mt-1 text-sm text-zinc-900">
                            {formatAppointment(
                              selectedBooking.appointmentDate,
                              selectedBooking.appointmentTime
                            )}
                          </p>
                          <p className="text-sm text-zinc-700">
                            {formatRelativeAge(selectedBooking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-300 bg-white p-3 lg:col-span-2">
                      <div className="flex items-start gap-2">
                        <Store className="mt-0.5 h-4 w-4 text-zinc-500" />
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600">
                            Store / Source
                          </p>
                          <p className="mt-1 text-sm text-zinc-900">
                            {displayText(selectedBooking.storeLocation)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-zinc-300 bg-white p-3">
                    <div className="flex items-start gap-2">
                      <Activity className="mt-0.5 h-4 w-4 text-zinc-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600">
                          Device and Services
                        </p>
                        <p className="mt-1 text-sm text-zinc-900">
                          {displayText(selectedBooking.brandName)} {displayText(selectedBooking.modelName, "")}
                        </p>
                        <div className="mt-2 space-y-2.5">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                              Customer Requested
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {customerRequestedServices.length > 0 ? (
                                customerRequestedServices.map((service) => (
                                  <span
                                    key={`customer-${service}`}
                                    className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-semibold text-zinc-700"
                                  >
                                    {service}
                                  </span>
                                ))
                              ) : (
                                <p className="text-sm text-zinc-600">
                                  No customer-requested services recorded.
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                              Added During Inspection
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {inspectionAddedServices.length > 0 ? (
                                inspectionAddedServices.map((service) => (
                                  <span
                                    key={`inspection-${service}`}
                                    className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-semibold text-zinc-700"
                                  >
                                    {service}
                                    <button
                                      type="button"
                                      onClick={() => void removeInspectionService(service)}
                                      disabled={isUpdating}
                                      aria-label={`Remove ${service}`}
                                      className="rounded p-0.5 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ))
                              ) : (
                                <p className="text-sm text-zinc-600">
                                  No extra services added yet.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-zinc-300 bg-zinc-50 p-2.5">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-600">
                            Inspection Service Manager
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Add any extra work discovered during inspection.
                          </p>

                          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                            <Input
                              value={inspectionServiceInput}
                              onChange={(event) =>
                                setInspectionServiceInput(event.target.value)
                              }
                              placeholder="Add service (e.g. Camera Repair)"
                              className="h-10 rounded-lg border-zinc-300 bg-white text-zinc-900 focus-visible:border-zinc-900 focus-visible:ring-zinc-900/15"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                void addInspectionService(inspectionServiceInput)
                              }
                              disabled={
                                isUpdating ||
                                normalizeServiceLabel(inspectionServiceInput).length === 0
                              }
                              className="h-10 rounded-lg border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                            >
                              <Plus className="h-4 w-4" />
                              Add Service
                            </Button>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {INSPECTION_SERVICE_PRESETS.map((service) => {
                              const alreadyAdded = normalizedIssueNames.has(
                                service.toLowerCase()
                              )

                              return (
                                <button
                                  key={service}
                                  type="button"
                                  onClick={() => void addInspectionService(service)}
                                  disabled={isUpdating || alreadyAdded}
                                  className={cn(
                                    "rounded-md border px-2 py-1 text-xs font-semibold transition",
                                    alreadyAdded
                                      ? "cursor-default border-zinc-300 bg-zinc-200 text-zinc-500"
                                      : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 hover:bg-zinc-100",
                                    isUpdating && "cursor-not-allowed opacity-70"
                                  )}
                                >
                                  + {service}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-zinc-300 bg-[radial-gradient(circle_at_top,_#f7f7f8_0%,_#f2f2f3_45%,_#ededee_100%)] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-zinc-700" />
                        <p className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-700">
                          Quote Template
                        </p>
                        <span className="rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-600">
                          Staff only
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openQuoteBuilder(quoteServices)}
                        disabled={quoteActionsLocked || isUpdating}
                        className="h-9 rounded-lg border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                      >
                        <FileText className="h-4 w-4" />
                        Add Prices to Services
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">
                      Manage pricing and send channels in a separate modal window.
                    </p>
                  </div>

                  <Dialog open={quoteBuilderOpen} onOpenChange={setQuoteBuilderOpen}>
                    <DialogContent className="max-h-[88vh] max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-6xl">
                      <DialogHeader className="border-b border-zinc-200 bg-zinc-50 px-6 py-4">
                        <DialogTitle className="text-zinc-900">
                          Quote Builder • {selectedBooking.bookingRef}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-600">
                          Add service prices, generate the quote template, and send via
                          Email, SMS, or WhatsApp.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="max-h-[calc(88vh-92px)] overflow-y-auto p-4 sm:p-6">
                        <div className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
                          <div className="rounded-xl border border-zinc-300 bg-white p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                              Service Pricing
                            </p>
                            <div className="mt-2 space-y-2">
                              {quoteRows.map((row) => (
                                <div
                                  key={`quote-service-${row.service}`}
                                  className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 sm:grid-cols-[1fr_180px]"
                                >
                                  <p className="text-sm font-medium text-zinc-800">
                                    {row.service}
                                  </p>
                                  <Input
                                    value={row.rawPrice}
                                    onChange={(event) =>
                                      updateServicePrice(row.service, event.target.value)
                                    }
                                    placeholder="e.g. 89.00"
                                    className="h-9 rounded-lg border-zinc-300 bg-white text-zinc-900 focus-visible:border-zinc-900 focus-visible:ring-zinc-900/15"
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => void generateServiceTemplate(quoteServices)}
                                disabled={!canGenerateTemplate}
                                className="h-10 rounded-lg border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                              >
                                <FileText className="h-4 w-4" />
                                Generate Template
                              </Button>
                            </div>

                            <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
                              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-600">
                                Send Quote
                              </p>
                              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    downloadQuoteTemplatePdf(quoteRows, quoteTotal)
                                  }
                                  disabled={!canDownloadQuote}
                                  className="h-9 rounded-lg border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => void sendQuoteByEmail(quoteRows, quoteTotal)}
                                  disabled={!canSendEmail}
                                  className="h-9 rounded-lg border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                                >
                                  <Mail className="h-4 w-4" />
                                  {isSendingEmail ? "Sending..." : "Email"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => sendQuoteBySms(quoteRows, quoteTotal)}
                                  disabled={!canSendMessage}
                                  className="h-9 rounded-lg border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  SMS
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => sendQuoteByWhatsApp(quoteRows, quoteTotal)}
                                  disabled={!canSendMessage}
                                  className="h-9 rounded-lg border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  WhatsApp
                                </Button>
                              </div>
                              {!quotePreviewReady ? (
                                <p className="mt-2 text-xs text-zinc-500">
                                  Generate template first to enable sending.
                                </p>
                              ) : null}
                            </div>

                            {hasMissingQuotePrice ? (
                              <p className="mt-2 text-xs text-rose-700">
                                Add a valid price for each service before generating.
                              </p>
                            ) : null}
                          </div>

                          <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white">
                            {!quotePreviewReady ? (
                              <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 bg-zinc-50 px-6 text-center">
                                <FileText className="h-6 w-6 text-zinc-500" />
                                <p className="text-sm font-semibold text-zinc-800">
                                  Template not generated yet
                                </p>
                                <p className="max-w-sm text-xs text-zinc-500">
                                  After pricing every service, click Generate Template.
                                </p>
                              </div>
                            ) : (
                              <div className="min-h-[320px]">
                                <div className="bg-[linear-gradient(140deg,#0f172a_0%,#111827_56%,#064e3b_100%)] px-4 py-3 text-white">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <img
                                        src={PHONE_GARAGE_LOGO_URL}
                                        alt="Phone Garage"
                                        className="h-8 w-auto"
                                      />
                                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                                        Service Quote
                                      </p>
                                      <p className="text-sm font-semibold">
                                        {selectedBooking.bookingRef}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[11px] uppercase tracking-[0.1em] text-zinc-300">
                                        Issued
                                      </p>
                                      <p className="text-xs">{formatQuoteDate(quoteIssuedAt)}</p>
                                      <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-zinc-300">
                                        Valid Until
                                      </p>
                                      <p className="text-xs">{formatQuoteDate(quoteValidUntil)}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3 p-3.5">
                                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                      Customer
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                                      {displayText(selectedBooking.customerName)}
                                    </p>
                                    <p className="text-xs text-zinc-700">
                                      {displayText(selectedBooking.brandName)}{" "}
                                      {displayText(selectedBooking.modelName, "")}
                                    </p>
                                  </div>

                                  <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                      Service Breakdown
                                    </p>
                                    <div className="mt-2 space-y-1.5">
                                      {quoteRows.map((row) => (
                                        <div
                                          key={`quote-line-${row.service}`}
                                          className="flex items-center justify-between gap-3 text-xs"
                                        >
                                          <p className="text-zinc-800">{row.service}</p>
                                          <p className="font-semibold text-zinc-900">
                                            {row.parsedAmount === null
                                              ? "TBC"
                                              : formatQuoteAmount(
                                                  row.parsedAmount.toFixed(2)
                                                )}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="rounded-xl border border-emerald-200 bg-[linear-gradient(135deg,#ecfeff_0%,#ecfdf3_100%)] p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                                      Total Quote (AUD)
                                    </p>
                                    <p className="mt-1 text-3xl font-extrabold leading-none text-emerald-800">
                                      {formatQuoteAmount(quoteTotal.toFixed(2))}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-300 bg-zinc-50 p-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600">
                        Customer Notes
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                        {displayText(
                          selectedBooking.issueNotes,
                          "No additional notes provided."
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-300 bg-zinc-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600">
                          Inspection Notes (Staff Only)
                        </p>
                        <span className="rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                          Internal
                        </span>
                      </div>

                      <Textarea
                        value={inspectionNotesInput}
                        onChange={(event) =>
                          setInspectionNotesInput(event.target.value)
                        }
                        placeholder="Add diagnostic findings, parts needed, internal handover notes..."
                        className="mt-2 min-h-[110px] resize-y border-zinc-300 bg-white text-zinc-900 focus-visible:border-zinc-900 focus-visible:ring-zinc-900/15"
                      />

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-zinc-500">
                          These notes are separate from customer notes.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void saveInspectionNotes()}
                          disabled={isUpdating || !inspectionNotesDirty}
                          className="h-9 rounded-lg border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                        >
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )
              })()
            )}
          </div>
        </article>
      </section>
    </div>
  )
}
