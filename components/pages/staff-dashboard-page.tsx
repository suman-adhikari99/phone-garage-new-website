"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  CircleCheck,
  CircleX,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  Hourglass,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  LogOut,
  Search,
  Sparkles,
  Store,
  UserRound,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type BookingRecord = {
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

type BookingStatus =
  | "new"
  | "in_progress"
  | "quote_sent"
  | "awaiting_customer"
  | "booked_in"
  | "completed"
  | "cancelled"

type SourceFilter = "all" | "quotes" | "bookings"

type DashboardMetric = {
  key: string
  label: string
  value: number
  helper: string
  icon: LucideIcon
}

const STATUS_OPTIONS: Array<{ value: BookingStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "quote_sent", label: "Quote Sent" },
  { value: "awaiting_customer", label: "Awaiting Customer" },
  { value: "booked_in", label: "Booked In" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const STATUS_PIPELINE: BookingStatus[] = [
  "new",
  "in_progress",
  "quote_sent",
  "awaiting_customer",
  "booked_in",
  "completed",
]

const STATUS_LABEL: Record<BookingStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  quote_sent: "Quote Sent",
  awaiting_customer: "Awaiting Customer",
  booked_in: "Booked In",
  completed: "Completed",
  cancelled: "Cancelled",
}

const STATUS_BADGE_CLASS: Record<BookingStatus, string> = {
  new: "border-zinc-300 bg-zinc-100 text-zinc-700",
  in_progress: "border-amber-300 bg-amber-100 text-amber-800",
  quote_sent: "border-stone-300 bg-stone-100 text-stone-800",
  awaiting_customer: "border-orange-300 bg-orange-100 text-orange-800",
  booked_in: "border-neutral-300 bg-neutral-100 text-neutral-800",
  completed: "border-zinc-900 bg-zinc-900 text-white",
  cancelled: "border-rose-300 bg-rose-100 text-rose-700",
}

function asStatus(value: string): BookingStatus | null {
  return STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as BookingStatus)
    : null
}

function getStatusCounts(bookings: BookingRecord[]) {
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

function toDayKey(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return ""
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function displayText(value: string | null | undefined, fallback = "Not provided") {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

function formatDateTime(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "Unknown"
  return new Date(timestamp).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function formatShortDate(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "Unknown"
  return new Date(timestamp).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

function formatAppointment(date: string, time: string) {
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

function formatIssueList(serviceName: string | null) {
  if (!serviceName?.trim()) return []
  return serviceName
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function isQuoteRequest(booking: BookingRecord) {
  const location = booking.storeLocation.toLowerCase()
  const time = booking.appointmentTime.toLowerCase()
  return location.includes("quote") || time.includes("quote")
}

function getNextWorkflowStatus(currentStatus: BookingStatus) {
  const index = STATUS_PIPELINE.indexOf(currentStatus)
  if (index < 0 || index >= STATUS_PIPELINE.length - 1) return null
  return STATUS_PIPELINE[index + 1]
}

function isValidPipelineStatus(status: BookingStatus) {
  return STATUS_PIPELINE.includes(status)
}

function toPhoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "")
  return normalized ? `tel:${normalized}` : ""
}

function csvCell(value: string) {
  const escaped = value.replaceAll('"', '""')
  return `"${escaped}"`
}

function getSourceLabel(booking: BookingRecord) {
  return isQuoteRequest(booking) ? "Quote" : "Booking"
}

function getSourcePillClass(booking: BookingRecord) {
  return isQuoteRequest(booking)
    ? "border-zinc-300 bg-zinc-100 text-zinc-700"
    : "border-zinc-300 bg-zinc-50 text-zinc-700"
}

function getPipelineProgress(status: BookingStatus) {
  if (!isValidPipelineStatus(status)) return 0
  const index = STATUS_PIPELINE.indexOf(status)
  return ((index + 1) / STATUS_PIPELINE.length) * 100
}

export function StaffDashboardPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all")
  const [selectedRef, setSelectedRef] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingRef, setUpdatingRef] = useState("")
  const [error, setError] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [lastRefreshedAt, setLastRefreshedAt] = useState(0)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [copiedRef, setCopiedRef] = useState("")

  const loadBookings = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setRefreshing(true)

    setError("")

    try {
      const response = await fetch("/api/bookings?limit=250", {
        cache: "no-store",
      })

      const payload = (await response.json().catch(() => null)) as
        | { bookings?: BookingRecord[]; message?: string; error?: string }
        | null

      if (response.status === 401) {
        router.replace("/admin-login")
        return
      }

      if (!response.ok) {
        throw new Error(
          payload?.message || payload?.error || "Failed to load request list."
        )
      }

      const nextBookings = Array.isArray(payload?.bookings) ? payload.bookings : []
      setBookings(nextBookings)
      setLastRefreshedAt(Date.now())
      setSelectedRef((currentRef) => {
        if (!currentRef) return nextBookings[0]?.bookingRef || ""
        const stillExists = nextBookings.some(
          (booking) => booking.bookingRef === currentRef
        )
        return stillExists ? currentRef : nextBookings[0]?.bookingRef || ""
      })
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load requests."
      setError(message)
    } finally {
      setLoading(false)
      if (showRefreshState) setRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  useEffect(() => {
    if (!autoRefresh) return

    const intervalId = window.setInterval(() => {
      void loadBookings()
    }, 30000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [autoRefresh, loadBookings])

  useEffect(() => {
    if (!actionMessage) return
    const timeoutId = window.setTimeout(() => {
      setActionMessage("")
    }, 2600)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [actionMessage])

  const updateStatus = useCallback(
    async (bookingRef: string, nextStatus: BookingStatus) => {
      setUpdatingRef(bookingRef)
      setError("")
      setActionMessage("")

      try {
        const response = await fetch("/api/bookings", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingRef,
            status: nextStatus,
          }),
        })

        const payload = (await response.json().catch(() => null)) as
          | { booking?: BookingRecord; message?: string; error?: string }
          | null

        if (response.status === 401) {
          router.replace("/admin-login")
          return
        }

        if (!response.ok) {
          throw new Error(
            payload?.message || payload?.error || "Failed to update request status."
          )
        }

        const updatedBooking = payload?.booking
        if (updatedBooking) {
          setBookings((previous) =>
            previous.map((booking) =>
              booking.bookingRef === bookingRef ? updatedBooking : booking
            )
          )
        }

        setActionMessage(`Updated ${bookingRef} to ${STATUS_LABEL[nextStatus]}.`)
      } catch (updateError) {
        const message =
          updateError instanceof Error
            ? updateError.message
            : "Failed to update request status."
        setError(message)
      } finally {
        setUpdatingRef("")
      }
    },
    [router]
  )

  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin-auth/logout", {
        method: "POST",
      })
    } finally {
      router.replace("/admin-login")
      router.refresh()
    }
  }, [router])

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return bookings.filter((booking) => {
      const quoteRequest = isQuoteRequest(booking)

      if (sourceFilter === "quotes" && !quoteRequest) return false
      if (sourceFilter === "bookings" && quoteRequest) return false

      const bookingStatus = asStatus(booking.status)
      if (statusFilter !== "all" && bookingStatus !== statusFilter) return false

      if (!normalizedSearch) return true

      const haystack = [
        booking.bookingRef,
        booking.customerName,
        booking.customerPhone,
        booking.customerEmail,
        booking.brandName,
        booking.modelName,
        booking.serviceName,
        booking.storeLocation,
        booking.issueNotes,
      ]
        .map((value) => value?.toLowerCase() || "")
        .join(" ")

      return haystack.includes(normalizedSearch)
    })
  }, [bookings, search, sourceFilter, statusFilter])

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

  const statusCounts = useMemo(() => getStatusCounts(bookings), [bookings])

  const totals = useMemo(() => {
    const quoteCount = bookings.filter(isQuoteRequest).length
    const openCount = bookings.filter((booking) => {
      const status = asStatus(booking.status)
      return status !== "completed" && status !== "cancelled"
    }).length
    const followUpCount = bookings.filter((booking) => {
      const status = asStatus(booking.status)
      return status === "quote_sent" || status === "awaiting_customer"
    }).length

    const todayKey = toDayKey(Date.now())
    const todayCount = bookings.filter(
      (booking) => toDayKey(booking.createdAt) === todayKey
    ).length

    return {
      total: bookings.length,
      quoteCount,
      bookingCount: bookings.length - quoteCount,
      openCount,
      followUpCount,
      todayCount,
    }
  }, [bookings])

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        key: "total",
        label: "Total Requests",
        value: totals.total,
        helper: "All submissions",
        icon: ClipboardList,
      },
      {
        key: "quotes",
        label: "Quote Requests",
        value: totals.quoteCount,
        helper: "Website quote leads",
        icon: Sparkles,
      },
      {
        key: "bookings",
        label: "Direct Bookings",
        value: totals.bookingCount,
        helper: "Booked time slots",
        icon: CalendarClock,
      },
      {
        key: "open",
        label: "Open Cases",
        value: totals.openCount,
        helper: "Needs team action",
        icon: Hourglass,
      },
      {
        key: "followup",
        label: "Follow-up Queue",
        value: totals.followUpCount,
        helper: "Waiting for customer",
        icon: AlertTriangle,
      },
      {
        key: "today",
        label: "Today",
        value: totals.todayCount,
        helper: "Received today",
        icon: Clock3,
      },
    ],
    [totals]
  )

  const weeklySeries = useMemo(() => {
    const dayKeys: string[] = []
    const counts = new Map<string, number>()
    const now = new Date()

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(now)
      date.setDate(now.getDate() - index)
      const key = toDayKey(date.getTime())
      dayKeys.push(key)
      counts.set(key, 0)
    }

    for (const booking of bookings) {
      const key = toDayKey(booking.createdAt)
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    }

    return dayKeys.map((key) => {
      const date = new Date(`${key}T00:00:00`)
      return {
        key,
        label: date.toLocaleDateString("en-AU", { weekday: "short" }),
        count: counts.get(key) || 0,
      }
    })
  }, [bookings])

  const issueMix = useMemo(() => {
    const counts = new Map<string, number>()

    for (const booking of bookings) {
      for (const issue of formatIssueList(booking.serviceName)) {
        counts.set(issue, (counts.get(issue) || 0) + 1)
      }
    }

    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)

    const max = sorted[0]?.[1] || 1
    return sorted.map(([name, count]) => ({
      name,
      count,
      widthPercent: Math.round((count / max) * 100),
    }))
  }, [bookings])

  const topBarMax = Math.max(...weeklySeries.map((item) => item.count), 1)

  const selectedStatus = selectedBooking
    ? asStatus(selectedBooking.status) || "new"
    : null

  const nextWorkflowStatus =
    selectedStatus && selectedStatus !== "cancelled"
      ? getNextWorkflowStatus(selectedStatus)
      : null

  const copyBookingRef = useCallback(async (bookingRef: string) => {
    try {
      await navigator.clipboard.writeText(bookingRef)
      setCopiedRef(bookingRef)
      setActionMessage(`Copied reference ${bookingRef}.`)
      window.setTimeout(() => {
        setCopiedRef((current) => (current === bookingRef ? "" : current))
      }, 1500)
    } catch {
      setError("Could not copy reference number.")
    }
  }, [])

  const downloadFilteredCsv = useCallback(() => {
    if (filteredBookings.length === 0) {
      setError("No filtered records to export.")
      return
    }

    const headers = [
      "Booking Ref",
      "Source",
      "Status",
      "Created At",
      "Customer Name",
      "Phone",
      "Email",
      "Device",
      "Issues",
      "Appointment",
      "Store Location",
      "Notes",
    ]

    const rows = filteredBookings.map((booking) => [
      booking.bookingRef,
      getSourceLabel(booking),
      STATUS_LABEL[asStatus(booking.status) || "new"],
      formatDateTime(booking.createdAt),
      displayText(booking.customerName),
      displayText(booking.customerPhone),
      displayText(booking.customerEmail),
      `${displayText(booking.brandName)} ${displayText(booking.modelName, "")}`.trim(),
      formatIssueList(booking.serviceName).join(" | "),
      formatAppointment(booking.appointmentDate, booking.appointmentTime),
      displayText(booking.storeLocation),
      displayText(booking.issueNotes, ""),
    ])

    const csv = [
      headers.map((header) => csvCell(header)).join(","),
      ...rows.map((row) => row.map((cell) => csvCell(cell)).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `staff-requests-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setActionMessage(`Exported ${filteredBookings.length} records to CSV.`)
  }, [filteredBookings])

  const lastRefreshedLabel =
    lastRefreshedAt > 0 ? formatDateTime(lastRefreshedAt) : "Not yet refreshed"

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[linear-gradient(155deg,#f6f5f1_0%,#edece7_50%,#f9f8f5_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(24,24,27,0.12),transparent_32%),radial-gradient(circle_at_90%_16%,rgba(161,98,7,0.12),transparent_30%),radial-gradient(circle_at_80%_86%,rgba(24,24,27,0.08),transparent_33%)]"
      />

      <div className="relative mx-auto max-w-[1440px]">
        <section className="rounded-[30px] border border-zinc-300/70 bg-white/90 p-5 shadow-[0_36px_90px_-52px_rgba(0,0,0,0.7)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Staff Command Center
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Quote and Repair Operations Dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-600 sm:text-base">
                Track every quote and booking from submission to completion. Filter
                quickly, keep follow-ups on time, and update statuses without leaving
                this screen.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void logout()}
                className="h-10 rounded-xl border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={downloadFilteredCsv}
                className="h-10 rounded-xl border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100"
              >
                <Download className="h-4 w-4" />
                Export Filtered
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadBookings(true)}
                disabled={refreshing}
                className="h-10 rounded-xl border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100"
              >
                <RefreshCw
                  className={cn("h-4 w-4", refreshing ? "animate-spin" : "")}
                />
                Refresh
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <article
                  key={metric.key}
                  className="group rounded-2xl border border-zinc-300/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-3 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      {metric.label}
                    </p>
                    <span className="rounded-lg border border-zinc-300 bg-white p-1.5 text-zinc-700">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold leading-none text-zinc-900">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{metric.helper}</p>
                </article>
              )
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-300 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">
                Status Snapshot
              </p>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition",
                  statusFilter === "all"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                )}
              >
                All ({bookings.length})
              </button>
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    statusFilter === option.value
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : `${STATUS_BADGE_CLASS[option.value]} hover:brightness-95`
                  )}
                >
                  {option.label} ({statusCounts[option.value]})
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            <article className="rounded-2xl border border-zinc-300 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">
                Incoming Volume (Last 7 Days)
              </p>
              <div className="mt-4 flex h-28 items-end gap-2">
                {weeklySeries.map((item) => (
                  <div key={item.key} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="relative h-20 w-full rounded-md bg-zinc-100">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-md bg-zinc-900"
                        style={{
                          height: `${Math.max(
                            8,
                            Math.round((item.count / topBarMax) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-zinc-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-zinc-300 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">
                Top Requested Issues
              </p>
              <div className="mt-3 space-y-2.5">
                {issueMix.length === 0 ? (
                  <p className="text-sm text-zinc-500">No issue data yet.</p>
                ) : (
                  issueMix.map((item) => (
                    <div key={item.name}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <p className="truncate pr-3 font-semibold text-zinc-800">
                          {item.name}
                        </p>
                        <p className="text-zinc-600">{item.count}</p>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100">
                        <div
                          className="h-2 rounded-full bg-zinc-900"
                          style={{ width: `${item.widthPercent}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </section>

        <section className="mt-4 rounded-[30px] border border-zinc-300/70 bg-white/90 p-4 shadow-[0_30px_74px_-50px_rgba(0,0,0,0.65)] sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by reference, customer, phone, email or issue"
                className="h-11 rounded-xl border-zinc-300 bg-white pl-10 text-zinc-900 focus-visible:border-zinc-900 focus-visible:ring-zinc-900/20"
              />
            </div>

            <div className="flex h-11 items-center gap-1 rounded-xl border border-zinc-300 bg-zinc-50 p-1">
              {(["all", "quotes", "bookings"] as SourceFilter[]).map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setSourceFilter(source)}
                  className={cn(
                    "h-9 rounded-lg px-3 text-xs font-semibold uppercase tracking-[0.08em] transition",
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
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
            <p>
              Showing <strong className="text-zinc-800">{filteredBookings.length}</strong>{" "}
              of <strong className="text-zinc-800">{bookings.length}</strong> records.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoRefresh((current) => !current)}
                className={cn(
                  "rounded-full border px-3 py-1 font-semibold transition",
                  autoRefresh
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-zinc-100 text-zinc-700"
                )}
              >
                Auto refresh {autoRefresh ? "On" : "Off"}
              </button>
              <span>Last sync: {lastRefreshedLabel}</span>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        {actionMessage ? (
          <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700">
            {actionMessage}
          </div>
        ) : null}

        <section className="mt-4 grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <article className="rounded-[28px] border border-zinc-300/70 bg-white/90 p-4 shadow-[0_22px_62px_-48px_rgba(0,0,0,0.65)] sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900">Request Queue</p>
                <p className="text-xs text-zinc-500">
                  {loading ? "Loading" : `${filteredBookings.length} items`}
                </p>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading customer requests...
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
                  No requests match your current filters.
                </div>
              ) : (
                <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                  {filteredBookings.map((booking) => {
                    const isActive = selectedBooking?.bookingRef === booking.bookingRef
                    const status = asStatus(booking.status) || "new"
                    const issues = formatIssueList(booking.serviceName)

                    return (
                      <button
                        key={booking.bookingRef}
                        type="button"
                        onClick={() => setSelectedRef(booking.bookingRef)}
                        className={cn(
                          "w-full rounded-2xl border p-3 text-left transition",
                          isActive
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-[0_20px_42px_-30px_rgba(0,0,0,0.9)]"
                            : "border-zinc-300 bg-white hover:border-zinc-900 hover:shadow-[0_18px_34px_-30px_rgba(0,0,0,0.7)]"
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
                              isActive
                                ? "border-white/30 bg-white/10 text-white"
                                : getSourcePillClass(booking)
                            )}
                          >
                            {getSourceLabel(booking)}
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
                              isActive
                                ? "border-white/30 bg-white/10 text-white"
                                : STATUS_BADGE_CLASS[status]
                            )}
                          >
                            {STATUS_LABEL[status]}
                          </span>
                          <span
                            className={cn(
                              "text-[11px]",
                              isActive ? "text-zinc-300" : "text-zinc-500"
                            )}
                          >
                            {booking.bookingRef}
                          </span>
                        </div>

                        <div className="mt-2 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "truncate text-sm font-semibold",
                                isActive ? "text-white" : "text-zinc-900"
                              )}
                            >
                              {displayText(booking.customerName)}
                            </p>
                            <p
                              className={cn(
                                "mt-0.5 truncate text-xs",
                                isActive ? "text-zinc-300" : "text-zinc-600"
                              )}
                            >
                              {`${displayText(booking.brandName)} ${displayText(booking.modelName, "")}`.trim()}
                            </p>
                          </div>
                          <p
                            className={cn(
                              "shrink-0 text-[11px]",
                              isActive ? "text-zinc-300" : "text-zinc-500"
                            )}
                          >
                            {formatShortDate(booking.createdAt)}
                          </p>
                        </div>

                        {issues.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {issues.slice(0, 2).map((issue) => (
                              <span
                                key={issue}
                                className={cn(
                                  "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                                  isActive
                                    ? "border-white/20 bg-white/10 text-white"
                                    : "border-zinc-200 bg-zinc-50 text-zinc-700"
                                )}
                              >
                                {issue}
                              </span>
                            ))}
                            {issues.length > 2 ? (
                              <span
                                className={cn(
                                  "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                                  isActive
                                    ? "border-white/20 bg-white/10 text-white"
                                    : "border-zinc-200 bg-zinc-50 text-zinc-700"
                                )}
                              >
                                +{issues.length - 2}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </article>
          </div>

          <div className="xl:col-span-7">
            <article className="sticky top-4 rounded-[28px] border border-zinc-300/70 bg-white/90 p-4 shadow-[0_24px_64px_-46px_rgba(0,0,0,0.65)] sm:p-5">
              {!selectedBooking ? (
                <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-600">
                  Select a request from the queue to open full details.
                </div>
              ) : (
                <>
                  {(() => {
                    const status = asStatus(selectedBooking.status) || "new"
                    const issues = formatIssueList(selectedBooking.serviceName)
                    const isUpdating = updatingRef === selectedBooking.bookingRef
                    const phoneHref = toPhoneHref(selectedBooking.customerPhone)
                    const pipelineProgress = getPipelineProgress(status)
                    const activePipelineIndex = STATUS_PIPELINE.indexOf(status)

                    return (
                      <>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
                                  getSourcePillClass(selectedBooking)
                                )}
                              >
                                {getSourceLabel(selectedBooking)}
                              </span>
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
                                  STATUS_BADGE_CLASS[status]
                                )}
                              >
                                {STATUS_LABEL[status]}
                              </span>
                            </div>

                            <h2 className="mt-2 text-xl font-semibold text-zinc-900">
                              {displayText(selectedBooking.customerName)}
                            </h2>
                            <p className="text-xs text-zinc-500">
                              Ref {selectedBooking.bookingRef} • Received{" "}
                              {formatDateTime(selectedBooking.createdAt)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void copyBookingRef(selectedBooking.bookingRef)}
                              className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-700 hover:border-zinc-900"
                            >
                              {copiedRef === selectedBooking.bookingRef ? (
                                <CircleCheck className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                              {copiedRef === selectedBooking.bookingRef
                                ? "Copied"
                                : "Copy Ref"}
                            </button>

                            <div className="flex h-10 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3">
                              <label
                                htmlFor="status-change"
                                className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500"
                              >
                                Status
                              </label>
                              <select
                                id="status-change"
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

                            {nextWorkflowStatus ? (
                              <Button
                                type="button"
                                onClick={() =>
                                  void updateStatus(
                                    selectedBooking.bookingRef,
                                    nextWorkflowStatus
                                  )
                                }
                                disabled={isUpdating}
                                className="h-10 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
                              >
                                Move to {STATUS_LABEL[nextWorkflowStatus]}
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-zinc-300 bg-zinc-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                            Workflow Progress
                          </p>

                          {status === "cancelled" ? (
                            <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                              <CircleX className="h-4 w-4" />
                              This request is marked as cancelled.
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
                                    <div
                                      key={step}
                                      className={cn(
                                        "rounded-xl border px-2 py-2 text-center",
                                        reached
                                          ? "border-zinc-900 bg-zinc-900 text-white"
                                          : "border-zinc-300 bg-white text-zinc-500",
                                        active && "ring-2 ring-zinc-900/20"
                                      )}
                                    >
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                                        {STATUS_LABEL[step]}
                                      </p>
                                    </div>
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
                              "inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm font-semibold text-zinc-900 transition",
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
                              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900 hover:bg-white"
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
                                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
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
                              <Store className="mt-0.5 h-4 w-4 text-zinc-500" />
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
                                  Store / Source
                                </p>
                                <p className="mt-1 text-sm text-zinc-900">
                                  {displayText(selectedBooking.storeLocation)}
                                </p>
                                <p className="text-sm text-zinc-700">
                                  {formatAppointment(
                                    selectedBooking.appointmentDate,
                                    selectedBooking.appointmentTime
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 rounded-2xl border border-zinc-300 bg-white p-3">
                          <div className="flex items-start gap-2">
                            <Activity className="mt-0.5 h-4 w-4 text-zinc-500" />
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
                                Device and Issues
                              </p>
                              <p className="mt-1 text-sm text-zinc-900">
                                {`${displayText(selectedBooking.brandName)} ${displayText(selectedBooking.modelName, "")}`.trim()}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {issues.length > 0 ? (
                                  issues.map((issue) => (
                                    <span
                                      key={issue}
                                      className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-700"
                                    >
                                      {issue}
                                    </span>
                                  ))
                                ) : (
                                  <p className="text-sm text-zinc-600">Not specified</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 rounded-2xl border border-zinc-300 bg-zinc-50 p-3">
                          <div className="flex items-start gap-2">
                            <MessageSquareText className="mt-0.5 h-4 w-4 text-zinc-500" />
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
                                Customer Notes
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                                {displayText(
                                  selectedBooking.issueNotes,
                                  "No additional notes provided."
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </>
              )}
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}
