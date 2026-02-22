"use client"

import Link from "next/link"
import {
  AlertCircle,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Clock3,
  Hourglass,
  Sparkles,
} from "lucide-react"
import { useDashboardData } from "./dashboard-data-context"
import {
  asStatus,
  displayText,
  formatDateTime,
  formatIssueList,
  getSourceLabel,
  isQuoteRequest,
  toDayKey,
} from "./dashboard-utils"

export function DashboardOverviewPage() {
  const { bookings, loading, lastRefreshedAt } = useDashboardData()

  const todayKey = toDayKey(Date.now())
  const total = bookings.length
  const quotes = bookings.filter(isQuoteRequest).length
  const bookingsDirect = total - quotes
  const openCases = bookings.filter((item) => {
    const status = asStatus(item.status)
    return status !== "completed" && status !== "cancelled"
  }).length
  const todayCount = bookings.filter((item) => toDayKey(item.createdAt) === todayKey).length
  const followUpCount = bookings.filter((item) => {
    const status = asStatus(item.status)
    return status === "quote_sent" || status === "awaiting_customer"
  }).length

  const latest = bookings.slice(0, 8)

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-6">
        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Total Requests
          </p>
          <p className="mt-2 text-3xl font-semibold leading-none text-zinc-900">{total}</p>
          <p className="mt-1 text-sm text-zinc-500">All customer submissions</p>
        </article>

        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Quotes
          </p>
          <p className="mt-2 text-3xl font-semibold leading-none text-zinc-900">{quotes}</p>
          <p className="mt-1 text-sm text-zinc-500">Lead requests via quote flow</p>
        </article>

        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Direct Bookings
          </p>
          <p className="mt-2 text-3xl font-semibold leading-none text-zinc-900">{bookingsDirect}</p>
          <p className="mt-1 text-sm text-zinc-500">Appointment-based bookings</p>
        </article>

        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Open Cases
          </p>
          <p className="mt-2 text-3xl font-semibold leading-none text-zinc-900">{openCases}</p>
          <p className="mt-1 text-sm text-zinc-500">Waiting for next staff action</p>
        </article>

        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Follow-up Queue
          </p>
          <p className="mt-2 text-3xl font-semibold leading-none text-zinc-900">{followUpCount}</p>
          <p className="mt-1 text-sm text-zinc-500">Quote sent or awaiting customer</p>
        </article>

        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Today
          </p>
          <p className="mt-2 text-3xl font-semibold leading-none text-zinc-900">{todayCount}</p>
          <p className="mt-1 text-sm text-zinc-500">New requests today</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[24px] border border-zinc-300 bg-white/95 p-5 shadow-[0_24px_56px_-42px_rgba(0,0,0,0.75)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Recent Requests
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                Latest customer activity
              </h2>
            </div>
            <Link
              href="/dashboard/requests"
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-zinc-700 hover:border-zinc-900"
            >
              Open Queue
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
              Loading latest requests...
            </div>
          ) : latest.length === 0 ? (
            <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
              No requests found yet.
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {latest.map((booking) => (
                <Link
                  key={booking.bookingRef}
                  href={`/dashboard/requests?ref=${encodeURIComponent(booking.bookingRef)}`}
                  className="block rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 transition hover:border-zinc-900 hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {displayText(booking.customerName)}
                      </p>
                      <p className="truncate text-sm text-zinc-600">
                        {displayText(booking.brandName)} {displayText(booking.modelName, "")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-700">
                        {getSourceLabel(booking)}
                      </p>
                      <p className="text-sm text-zinc-500">{booking.bookingRef}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {formatIssueList(booking.serviceName)
                      .slice(0, 2)
                      .map((issue) => (
                        <span
                          key={issue}
                          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700"
                        >
                          {issue}
                        </span>
                      ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-[24px] border border-zinc-300 bg-white/95 p-5 shadow-[0_24px_56px_-42px_rgba(0,0,0,0.75)]">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Quick Actions
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">
            Move faster with shortcuts
          </h2>

          <div className="mt-4 space-y-2">
            <Link
              href="/dashboard/requests?status=new&view=flow"
              className="flex items-center justify-between rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 transition hover:border-zinc-900 hover:bg-white"
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-zinc-700" />
                <span className="text-sm font-semibold text-zinc-900">Review new requests</span>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </Link>

            <Link
              href="/dashboard/requests?status=awaiting_customer&view=flow"
              className="flex items-center justify-between rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 transition hover:border-zinc-900 hover:bg-white"
            >
              <div className="flex items-center gap-2">
                <Hourglass className="h-4 w-4 text-zinc-700" />
                <span className="text-sm font-semibold text-zinc-900">Customer follow-up queue</span>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </Link>

            <Link
              href="/dashboard/requests?source=quotes&view=queue"
              className="flex items-center justify-between rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 transition hover:border-zinc-900 hover:bg-white"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-zinc-700" />
                <span className="text-sm font-semibold text-zinc-900">Focus on quote leads</span>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </Link>

            <Link
              href="/dashboard/analytics"
              className="flex items-center justify-between rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 transition hover:border-zinc-900 hover:bg-white"
            >
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-zinc-700" />
                <span className="text-sm font-semibold text-zinc-900">View performance trends</span>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </Link>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-zinc-700" />
              <p>Last updated: {lastRefreshedAt > 0 ? formatDateTime(lastRefreshedAt) : "Not synced yet"}</p>
            </div>
            <p className="mt-1">
              Use Requests to update status and contact customers, then monitor trend
              changes in Analytics.
            </p>
          </div>
        </article>
      </section>
    </div>
  )
}
