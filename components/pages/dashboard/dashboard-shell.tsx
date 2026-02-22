"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  ChartColumnIncreasing,
  ClipboardList,
  LayoutGrid,
  LogOut,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DashboardDataProvider,
  useDashboardData,
} from "./dashboard-data-context"
import { formatDateTime } from "./dashboard-utils"

type NavItem = {
  href: string
  label: string
  description: string
  icon: typeof LayoutGrid
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    description: "Live snapshot",
    icon: LayoutGrid,
  },
  {
    href: "/dashboard/requests",
    label: "Requests",
    description: "Handle queue",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    description: "Performance trends",
    icon: ChartColumnIncreasing,
  },
]

const PHONE_GARAGE_LOGO_URL = "https://www.phonegarage.com.au/headerTop.png"

function getPageTitle(pathname: string) {
  if (pathname === "/dashboard/requests") return "Request Management"
  if (pathname === "/dashboard/analytics") return "Analytics and Insights"
  return "Operations Overview"
}

function DashboardFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const {
    loadBookings,
    refreshing,
    logout,
    lastRefreshedAt,
    error,
    actionMessage,
  } = useDashboardData()

  const lastRefreshedLabel =
    lastRefreshedAt > 0 ? formatDateTime(lastRefreshedAt) : "Not synced yet"

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[linear-gradient(140deg,#f7f6f2_0%,#eeece4_45%,#f8f7f4_100%)] text-zinc-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_11%_10%,rgba(17,24,39,0.12),transparent_32%),radial-gradient(circle_at_92%_7%,rgba(120,53,15,0.11),transparent_34%),radial-gradient(circle_at_88%_91%,rgba(17,24,39,0.08),transparent_36%)]"
      />

      <div className="relative mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[300px_1fr]">
        <aside className="hidden border-r border-zinc-300/70 bg-white/85 p-5 backdrop-blur lg:block">
          <div className="rounded-2xl border border-zinc-300 bg-zinc-950 px-4 py-3 text-white">
            <img
              src={PHONE_GARAGE_LOGO_URL}
              alt="Phone Garage"
              className="h-8 w-auto"
            />
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-300">
              Phone Garage
            </p>
            <p className="mt-1 text-xl font-semibold leading-tight">Admin Console</p>
            <p className="mt-1 text-sm text-zinc-300">Quotes and booking operations</p>
          </div>

          <nav className="mt-5 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group block rounded-2xl border px-3 py-3 transition",
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "rounded-lg border p-1.5",
                        active ? "border-white/35 bg-white/10" : "border-zinc-300 bg-zinc-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p
                        className={cn(
                          "text-sm",
                          active ? "text-zinc-300" : "text-zinc-500"
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-zinc-300 bg-white px-3 py-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600">
              Last Sync
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{lastRefreshedLabel}</p>
            <p className="mt-1 text-sm text-zinc-500">
              Data auto-refreshes every 30 seconds.
            </p>
          </div>
        </aside>

        <div className="px-4 py-4 sm:px-6 lg:px-7 lg:py-6">
          <header className="rounded-[26px] border border-zinc-300/80 bg-white/90 p-4 shadow-[0_28px_70px_-54px_rgba(0,0,0,0.85)] backdrop-blur sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={PHONE_GARAGE_LOGO_URL}
                  alt="Phone Garage"
                  className="h-10 w-auto rounded-md border border-zinc-300 bg-white px-1.5 py-1"
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-600">
                    Staff Workspace
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                    {getPageTitle(pathname)}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void loadBookings(true)}
                  disabled={refreshing}
                  className="h-10 rounded-xl border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                >
                  <RefreshCw
                    className={cn("h-4 w-4", refreshing ? "animate-spin" : "")}
                  />
                  Refresh
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void logout()}
                  className="h-10 rounded-xl border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:shadow-none hover:text-zinc-900"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:hidden">
              <nav className="grid grid-cols-3 gap-2">
                {NAV_ITEMS.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-xl border px-2 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.08em]",
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 bg-white text-zinc-700"
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </header>

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

          <section className="mt-4">{children}</section>
        </div>
      </div>
    </div>
  )
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <DashboardDataProvider>
      <DashboardFrame>{children}</DashboardFrame>
    </DashboardDataProvider>
  )
}
