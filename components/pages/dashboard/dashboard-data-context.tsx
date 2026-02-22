"use client"

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import type { BookingRecord, BookingStatus } from "./dashboard-utils"
import { downloadBookingsCsv, STATUS_LABEL } from "./dashboard-utils"

type BookingUpdateFields = {
  status?: BookingStatus
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

type DashboardDataContextValue = {
  bookings: BookingRecord[]
  loading: boolean
  refreshing: boolean
  updatingRef: string
  autoRefresh: boolean
  error: string
  actionMessage: string
  lastRefreshedAt: number
  setAutoRefresh: (value: boolean) => void
  setError: (value: string) => void
  setActionMessage: (value: string) => void
  loadBookings: (showRefreshState?: boolean) => Promise<void>
  updateBooking: (
    bookingRef: string,
    updates: BookingUpdateFields,
    successMessage?: string
  ) => Promise<void>
  updateStatus: (bookingRef: string, status: BookingStatus) => Promise<void>
  exportBookingsCsv: (records: BookingRecord[], filenamePrefix: string) => void
  logout: () => Promise<void>
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null)

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingRef, setUpdatingRef] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [error, setError] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [lastRefreshedAt, setLastRefreshedAt] = useState(0)

  const loadBookings = useCallback(
    async (showRefreshState = false) => {
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

        const records = Array.isArray(payload?.bookings) ? payload.bookings : []
        setBookings(records)
        setLastRefreshedAt(Date.now())
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Failed to load requests."
        setError(message)
      } finally {
        setLoading(false)
        if (showRefreshState) setRefreshing(false)
      }
    },
    [router]
  )

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
    }, 3000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [actionMessage])

  const updateBooking = useCallback(
    async (
      bookingRef: string,
      updates: BookingUpdateFields,
      successMessage?: string
    ) => {
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
            ...updates,
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
            payload?.message || payload?.error || "Failed to update request."
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

        const normalizedSuccessMessage = successMessage?.trim() || ""
        if (normalizedSuccessMessage) {
          setActionMessage(normalizedSuccessMessage)
        } else if (updates.status) {
          setActionMessage(
            `Updated ${bookingRef} to ${STATUS_LABEL[updates.status]}.`
          )
        } else {
          setActionMessage(`Updated ${bookingRef}.`)
        }
      } catch (updateError) {
        const message =
          updateError instanceof Error
            ? updateError.message
            : "Failed to update request."
        setError(message)
      } finally {
        setUpdatingRef("")
      }
    },
    [router]
  )

  const updateStatus = useCallback(
    async (bookingRef: string, status: BookingStatus) => {
      await updateBooking(bookingRef, { status })
    },
    [updateBooking]
  )

  const exportBookingsCsvData = useCallback(
    (records: BookingRecord[], filenamePrefix: string) => {
      if (records.length === 0) {
        setError("No records to export.")
        return
      }

      const exported = downloadBookingsCsv(records, filenamePrefix)
      if (!exported) {
        setError("Could not export CSV right now.")
        return
      }

      setActionMessage(`Exported ${records.length} records to CSV.`)
    },
    []
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

  const value = useMemo<DashboardDataContextValue>(
    () => ({
      bookings,
      loading,
      refreshing,
      updatingRef,
      autoRefresh,
      error,
      actionMessage,
      lastRefreshedAt,
      setAutoRefresh,
      setError,
      setActionMessage,
      loadBookings,
      updateBooking,
      updateStatus,
      exportBookingsCsv: exportBookingsCsvData,
      logout,
    }),
    [
      bookings,
      loading,
      refreshing,
      updatingRef,
      autoRefresh,
      error,
      actionMessage,
      lastRefreshedAt,
      loadBookings,
      updateBooking,
      updateStatus,
      exportBookingsCsvData,
      logout,
    ]
  )

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext)
  if (!context) {
    throw new Error("useDashboardData must be used within DashboardDataProvider")
  }
  return context
}
