"use client"

import { useMemo } from "react"
import {
  Activity,
  ChartColumnIncreasing,
  MapPin,
  ScanSearch,
  ShieldCheck,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useDashboardData } from "./dashboard-data-context"
import {
  asStatus,
  formatIssueList,
  STATUS_LABEL,
  STATUS_OPTIONS,
  toDayKey,
} from "./dashboard-utils"

const STATUS_PIE_COLORS = [
  "#111827",
  "#27272a",
  "#3f3f46",
  "#52525b",
  "#71717a",
  "#a1a1aa",
  "#d4d4d8",
]

const volumeChartConfig = {
  count: {
    label: "Requests",
    color: "#111827",
  },
} satisfies ChartConfig

const statusChartConfig = {
  count: {
    label: "Requests",
    color: "#111827",
  },
} satisfies ChartConfig

function dayLabel(dayKey: string) {
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString("en-AU", {
    weekday: "short",
  })
}

function fullDayLabel(dayKey: string) {
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

export function DashboardAnalyticsPage() {
  const { bookings } = useDashboardData()

  const fourteenDaySeries = useMemo(() => {
    const keys: string[] = []
    const counts = new Map<string, number>()
    const now = new Date()

    for (let dayOffset = 13; dayOffset >= 0; dayOffset -= 1) {
      const date = new Date(now)
      date.setDate(now.getDate() - dayOffset)
      const key = toDayKey(date.getTime())
      keys.push(key)
      counts.set(key, 0)
    }

    for (const booking of bookings) {
      const key = toDayKey(booking.createdAt)
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    }

    return keys.map((key) => ({
      key,
      label: dayLabel(key),
      fullLabel: fullDayLabel(key),
      count: counts.get(key) || 0,
    }))
  }, [bookings])

  const totalLast14Days = useMemo(
    () => fourteenDaySeries.reduce((sum, item) => sum + item.count, 0),
    [fourteenDaySeries]
  )

  const averageDaily = useMemo(() => {
    if (fourteenDaySeries.length === 0) return 0
    return Math.round((totalLast14Days / fourteenDaySeries.length) * 10) / 10
  }, [fourteenDaySeries, totalLast14Days])

  const peakDay = useMemo(() => {
    if (fourteenDaySeries.length === 0) return null
    return fourteenDaySeries.reduce((best, current) =>
      current.count > best.count ? current : best
    )
  }, [fourteenDaySeries])

  const statusCounts = useMemo(() => {
    const counts = STATUS_OPTIONS.map((option) => ({
      status: option.value,
      label: option.label,
      count: bookings.filter((booking) => asStatus(booking.status) === option.value).length,
    }))
    const max = Math.max(...counts.map((item) => item.count), 1)

    return counts.map((item) => ({
      ...item,
      widthPercent: Math.round((item.count / max) * 100),
      sharePercent: bookings.length
        ? Math.round((item.count / bookings.length) * 100)
        : 0,
    }))
  }, [bookings])

  const statusPieData = useMemo(
    () =>
      statusCounts
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .map((item, index) => ({
          ...item,
          fill: STATUS_PIE_COLORS[index % STATUS_PIE_COLORS.length],
        })),
    [statusCounts]
  )

  const issueMix = useMemo(() => {
    const counts = new Map<string, number>()
    for (const booking of bookings) {
      for (const issue of formatIssueList(booking.serviceName)) {
        counts.set(issue, (counts.get(issue) || 0) + 1)
      }
    }

    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
    const max = sorted[0]?.[1] || 1
    const totalMentions = sorted.reduce((sum, [, count]) => sum + count, 0)

    return sorted.map(([name, count]) => ({
      name,
      count,
      widthPercent: Math.round((count / max) * 100),
      sharePercent: totalMentions ? Math.round((count / totalMentions) * 100) : 0,
    }))
  }, [bookings])

  const locationMix = useMemo(() => {
    const counts = new Map<string, number>()

    for (const booking of bookings) {
      const key = booking.storeLocation.trim() || "Unknown"
      counts.set(key, (counts.get(key) || 0) + 1)
    }

    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
    const max = sorted[0]?.[1] || 1

    return sorted.map(([name, count]) => ({
      name,
      count,
      widthPercent: Math.round((count / max) * 100),
      sharePercent: bookings.length
        ? Math.round((count / bookings.length) * 100)
        : 0,
    }))
  }, [bookings])

  const completedCount = bookings.filter(
    (booking) => asStatus(booking.status) === "completed"
  ).length
  const completionRate = bookings.length
    ? Math.round((completedCount / bookings.length) * 100)
    : 0

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Completion Rate
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{completionRate}%</p>
          <p className="mt-1 text-sm text-zinc-500">Completed vs all requests</p>
        </article>

        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Total Completed
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{completedCount}</p>
          <p className="mt-1 text-sm text-zinc-500">Requests closed successfully</p>
        </article>

        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Active Statuses
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">
            {statusCounts.filter((item) => item.count > 0).length}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Status buckets in use now</p>
        </article>

        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Unique Issues
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{issueMix.length}</p>
          <p className="mt-1 text-sm text-zinc-500">Top issue categories tracked</p>
        </article>
      </section>

      <section className="grid gap-4 2xl:grid-cols-[1.2fr_0.8fr]">
        <article className="relative overflow-hidden rounded-[24px] border border-zinc-300 bg-white/95 p-5 shadow-[0_24px_56px_-42px_rgba(0,0,0,0.75)]">
          <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-zinc-200/60 blur-3xl" />

          <div className="relative flex items-start gap-2">
            <ChartColumnIncreasing className="mt-0.5 h-5 w-5 text-zinc-700" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Volume Trend
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                Requests in the last 14 days
              </h2>
            </div>
          </div>

          <div className="relative mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                Total (14 days)
              </p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">{totalLast14Days}</p>
            </div>
            <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                Average / Day
              </p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">{averageDaily}</p>
            </div>
            <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                Peak Day
              </p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">
                {peakDay?.count || 0}
              </p>
              <p className="text-sm text-zinc-500">{peakDay?.fullLabel || "-"}</p>
            </div>
          </div>

          <ChartContainer
            config={volumeChartConfig}
            className="relative mt-4 h-[280px] w-full"
          >
            <AreaChart data={fourteenDaySeries} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={16}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <ChartTooltip
                cursor={{ stroke: "#a1a1aa", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const point = payload?.[0]?.payload as
                        | { fullLabel?: string }
                        | undefined
                      return point?.fullLabel || ""
                    }}
                  />
                }
              />
              <Area
                dataKey="count"
                type="monotone"
                fill="url(#volumeFill)"
                stroke="#111827"
                strokeWidth={2.6}
                activeDot={{ r: 5, fill: "#111827" }}
              />
            </AreaChart>
          </ChartContainer>
        </article>

        <article className="rounded-[24px] border border-zinc-300 bg-white/95 p-5 shadow-[0_24px_56px_-42px_rgba(0,0,0,0.75)]">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-zinc-700" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Status Distribution
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                Where requests currently sit
              </h2>
            </div>
          </div>

          {statusPieData.length === 0 ? (
            <p className="mt-4 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-4 text-sm text-zinc-600">
              No status data yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]">
              <div className="rounded-2xl border border-zinc-300 bg-zinc-50 p-3">
                <ChartContainer
                  config={statusChartConfig}
                  className="mx-auto h-[220px] w-full max-w-[230px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={statusPieData}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={54}
                      outerRadius={84}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {statusPieData.map((item) => (
                        <Cell key={item.status} fill={item.fill} />
                      ))}
                    </Pie>
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x="50%"
                        y="48%"
                        className="fill-zinc-900 text-[22px] font-semibold"
                      >
                        {bookings.length}
                      </tspan>
                      <tspan
                        x="50%"
                        y="61%"
                        className="fill-zinc-500 text-[11px]"
                      >
                        total requests
                      </tspan>
                    </text>
                  </PieChart>
                </ChartContainer>
              </div>

              <div className="space-y-2.5">
                {statusCounts.map((item) => (
                  <div
                    key={item.status}
                    className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <p className="font-semibold text-zinc-800">{item.label}</p>
                      <div className="text-right">
                        <p className="font-semibold text-zinc-900">{item.count}</p>
                        <p className="text-xs text-zinc-500">{item.sharePercent}%</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-200">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#111827_0%,#52525b_100%)]"
                        style={{ width: `${item.widthPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[24px] border border-zinc-300 bg-white/95 p-5 shadow-[0_24px_56px_-42px_rgba(0,0,0,0.75)]">
          <div className="flex items-start gap-2">
            <ScanSearch className="mt-0.5 h-5 w-5 text-zinc-700" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Top Issues
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                Most requested services
              </h2>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {issueMix.length === 0 ? (
              <p className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-4 text-sm text-zinc-600">
                No issue data yet.
              </p>
            ) : (
              issueMix.map((item, index) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs font-semibold text-zinc-700">
                        {index + 1}
                      </span>
                      <p className="truncate text-sm font-semibold text-zinc-800">
                        {item.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-900">{item.count}</p>
                      <p className="text-xs text-zinc-500">{item.sharePercent}%</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-200">
                    <div
                      className="h-2 rounded-full bg-[linear-gradient(90deg,#111827_0%,#52525b_100%)]"
                      style={{ width: `${item.widthPercent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[24px] border border-zinc-300 bg-white/95 p-5 shadow-[0_24px_56px_-42px_rgba(0,0,0,0.75)]">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-5 w-5 text-zinc-700" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Store / Source Mix
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                Where requests are coming from
              </h2>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {locationMix.length === 0 ? (
              <p className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-4 text-sm text-zinc-600">
                No location data yet.
              </p>
            ) : (
              locationMix.map((item, index) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs font-semibold text-zinc-700">
                        {index + 1}
                      </span>
                      <p className="truncate text-sm font-semibold text-zinc-800">
                        {item.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-900">{item.count}</p>
                      <p className="text-xs text-zinc-500">{item.sharePercent}%</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-200">
                    <div
                      className="h-2 rounded-full bg-[linear-gradient(90deg,#111827_0%,#52525b_100%)]"
                      style={{ width: `${item.widthPercent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[24px] border border-zinc-300 bg-white/95 p-5 shadow-[0_24px_56px_-42px_rgba(0,0,0,0.75)]">
        <div className="flex items-start gap-2">
          <Activity className="mt-0.5 h-5 w-5 text-zinc-700" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Status Legend
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900">
              Workflow states used in this dashboard
            </h2>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {STATUS_OPTIONS.map((item, index) => (
            <div
              key={item.value}
              className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: STATUS_PIE_COLORS[index % STATUS_PIE_COLORS.length],
                  }}
                />
                <p className="text-sm font-semibold text-zinc-900">{STATUS_LABEL[item.value]}</p>
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                {item.value.replaceAll("_", " ")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
