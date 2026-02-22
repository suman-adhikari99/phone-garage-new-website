"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CalendarClock,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Smartphone,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type BookingRecord = {
  bookingRef: string
  createdAt: number
  brandName: string | null
  modelName: string | null
  serviceName: string | null
  appointmentDate: string
  appointmentTime: string
  storeLocation: string
  customerName: string
  customerPhone: string
  customerEmail: string
  issueNotes: string | null
}

function displayText(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : "Not provided"
}

function formatCreatedAt(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "Not available"
  return new Date(timestamp).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function formatAppointment(date: string, time: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    return `${displayText(date)} • ${displayText(time)}`
  }
  const readableDate = parsed.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  return `${readableDate} • ${displayText(time)}`
}

function formatDevice(brand: string | null, model: string | null) {
  const parts = [brand?.trim(), model?.trim()].filter(
    (value): value is string => Boolean(value && value.length > 0)
  )
  return parts.length > 0 ? parts.join(" ") : "Not provided"
}

export function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingRef = searchParams.get("bookingRef")?.trim() || ""
  const [booking, setBooking] = useState<BookingRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const loadBooking = async () => {
    if (!bookingRef) return
    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch(
        `/api/bookings?bookingRef=${encodeURIComponent(bookingRef)}`,
        { cache: "no-store" }
      )

      const payload = (await response.json().catch(() => null)) as
        | { booking?: BookingRecord; message?: string; error?: string }
        | null

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            payload?.error ||
            "Could not load your booking details right now."
        )
      }

      setBooking(payload?.booking || null)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not load your booking details right now."
      setErrorMessage(message)
      setBooking(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadBooking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingRef])

  return (
    <section className="relative min-h-[calc(100vh-10rem)] overflow-hidden bg-[radial-gradient(circle_at_14%_16%,rgba(39,39,42,0.14),transparent_42%),radial-gradient(circle_at_88%_84%,rgba(82,82,91,0.14),transparent_40%),linear-gradient(180deg,#fafafa_0%,#f4f4f5_100%)] py-14 sm:py-20">
      <div className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-zinc-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-zinc-500/20 blur-3xl" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-zinc-300/80 bg-white/92 p-6 shadow-[0_30px_80px_-36px_rgba(24,24,27,0.4)] backdrop-blur sm:p-10">
          <div className="pointer-events-none absolute -top-20 right-[-3rem] h-52 w-52 rounded-full bg-zinc-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-zinc-400/25 blur-3xl" />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="relative mb-6 h-32 w-32">
              <span className="absolute inset-0 rounded-full bg-zinc-300/60 blur-xl" />
              <svg
                className="relative h-full w-full"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="60" cy="60" r="45" stroke="#e4e4e7" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  stroke="#18181b"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="success-ring-draw"
                />
                <path
                  d="M40 61L54 75L82 47"
                  stroke="#09090b"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="success-check-draw"
                />
              </svg>
            </div>

            <span className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-800">
              Submission Successful
            </span>
            <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Your Request Has Been Sent
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-700 sm:text-base">
              Thank you. Our team received your details and will contact you soon.
              Keep your reference number for quick follow-up.
            </p>

            <div className="mt-5 grid w-full gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">Step 1</p>
                <p className="mt-1 text-xs font-medium text-zinc-800">Request received</p>
              </div>
              <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">Step 2</p>
                <p className="mt-1 text-xs font-medium text-zinc-800">We review details</p>
              </div>
              <div className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">Step 3</p>
                <p className="mt-1 text-xs font-medium text-zinc-800">We contact you</p>
              </div>
            </div>

            <div className="mt-6 w-full rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f4f4f5_100%)] px-4 py-3 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-700">
                Reference Number
              </p>
              <p className="mt-1 break-all font-mono text-lg font-bold tracking-[0.06em] text-zinc-900 sm:text-2xl">
                {bookingRef || "Pending"}
              </p>
            </div>

            <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
              <Button
                onClick={() => router.push("/")}
                className="h-11 rounded-xl bg-zinc-900 text-white hover:bg-black"
              >
                <Home className="mr-2 h-4 w-4" />
                Go To Home
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDetails((value) => !value)}
                disabled={!bookingRef}
                className="h-11 rounded-xl border-zinc-400 bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                {showDetails ? "Hide My Details" : "See My Details"}
              </Button>
            </div>

            {showDetails && (
              <div className="animate-fade-up mt-5 w-full rounded-2xl border border-zinc-300 bg-white p-4 text-left sm:p-5">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading booking details...
                  </div>
                ) : errorMessage ? (
                  <p className="text-sm font-medium text-red-600">{errorMessage}</p>
                ) : booking ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">Submitted At</p>
                      <p className="mt-1 text-sm font-medium text-zinc-900">{formatCreatedAt(booking.createdAt)}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">Customer</p>
                      <p className="mt-1 text-sm font-medium text-zinc-900">{displayText(booking.customerName)}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
                        <Phone className="h-3.5 w-3.5" />
                        Phone
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-900">{displayText(booking.customerPhone)}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-900">{displayText(booking.customerEmail)}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
                        <Smartphone className="h-3.5 w-3.5" />
                        Device
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-900">
                        {formatDevice(booking.brandName, booking.modelName)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
                        <Wrench className="h-3.5 w-3.5" />
                        Service
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-900">{displayText(booking.serviceName)}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3 sm:col-span-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Appointment
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-900">
                        {formatAppointment(booking.appointmentDate, booking.appointmentTime)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3 sm:col-span-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
                        <MapPin className="h-3.5 w-3.5" />
                        Store Location
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-900">{displayText(booking.storeLocation)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-600">No details available for this reference yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
