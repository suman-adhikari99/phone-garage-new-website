"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  MailCheck,
  Megaphone,
  RefreshCw,
  Send,
  UsersRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useDashboardData } from "./dashboard-data-context"
import { displayText, formatDateTime } from "./dashboard-utils"

type MarketingRecipient = {
  email: string
  customerName: string | null
  lastSeenAt: number
  bookingCount: number
}

type AudienceResponse = {
  configured?: boolean
  recipientCount?: number
  recipients?: MarketingRecipient[]
  previewRecipients?: MarketingRecipient[]
  message?: string
  error?: string
}

type SendResponse = {
  message?: string
  sentCount?: number
  attemptedCount?: number
  selectedCount?: number
  error?: string
}

function plural(value: number, singular: string, pluralWord: string) {
  return `${value} ${value === 1 ? singular : pluralWord}`
}

function normalizeEmailKey(value: string) {
  return value.trim().toLowerCase()
}

function uniqueEmails(emails: string[]) {
  const deduped = new Map<string, string>()
  for (const email of emails) {
    const trimmed = email.trim()
    if (!trimmed) continue
    deduped.set(normalizeEmailKey(trimmed), trimmed)
  }
  return Array.from(deduped.values())
}

export function DashboardMarketingPage() {
  const router = useRouter()
  const { setError, setActionMessage } = useDashboardData()
  const hasManualSelectionRef = useRef(false)

  const [configured, setConfigured] = useState(false)
  const [audienceCount, setAudienceCount] = useState(0)
  const [recipients, setRecipients] = useState<MarketingRecipient[]>([])
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [recipientSearch, setRecipientSearch] = useState("")
  const [loadingAudience, setLoadingAudience] = useState(true)
  const [sending, setSending] = useState(false)
  const [lastSentAt, setLastSentAt] = useState(0)

  const [subject, setSubject] = useState("Phone Garage Special Offer")
  const [offerTitle, setOfferTitle] = useState("Limited-time repair offer")
  const [message, setMessage] = useState(
    "Hi,\n\nWe're running new repair offers this week at Phone Garage. Reply to this email if you'd like a fresh quote or want to book your device in.\n\nThanks,\nPhone Garage Team"
  )

  const refreshAudience = useCallback(async () => {
    setLoadingAudience(true)

    try {
      const response = await fetch("/api/marketing/bulk-email", {
        cache: "no-store",
      })

      const payload = (await response.json().catch(() => null)) as
        | AudienceResponse
        | null

      if (response.status === 401) {
        router.replace("/admin-login")
        return
      }

      if (!response.ok) {
        throw new Error(
          payload?.message || payload?.error || "Failed to load marketing audience."
        )
      }

      const nextRecipients = Array.isArray(payload?.recipients)
        ? payload.recipients
        : Array.isArray(payload?.previewRecipients)
          ? payload.previewRecipients
          : []

      setConfigured(Boolean(payload?.configured))
      setRecipients(nextRecipients)
      setAudienceCount(
        Number.isFinite(payload?.recipientCount)
          ? Number(payload?.recipientCount)
          : nextRecipients.length
      )

      setSelectedEmails((current) => {
        const availableEmails = uniqueEmails(
          nextRecipients.map((recipient) => recipient.email)
        )

        if (!hasManualSelectionRef.current) {
          return availableEmails
        }

        const availableKeys = new Set(availableEmails.map(normalizeEmailKey))
        return current.filter((email) => availableKeys.has(normalizeEmailKey(email)))
      })

      setError("")
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Failed to load marketing audience."
      setError(messageText)
    } finally {
      setLoadingAudience(false)
    }
  }, [router, setError])

  useEffect(() => {
    void refreshAudience()
  }, [refreshAudience])

  const selectedEmailSet = useMemo(
    () => new Set(selectedEmails.map(normalizeEmailKey)),
    [selectedEmails]
  )

  const filteredRecipients = useMemo(() => {
    const query = recipientSearch.trim().toLowerCase()
    if (!query) return recipients

    return recipients.filter((recipient) => {
      const name = recipient.customerName?.toLowerCase() || ""
      const email = recipient.email.toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [recipientSearch, recipients])

  const selectedCount = selectedEmails.length

  const disableSend =
    sending || loadingAudience || !configured || selectedCount <= 0

  const audienceLabel = useMemo(
    () => plural(audienceCount, "customer", "customers"),
    [audienceCount]
  )

  const selectedLabel = useMemo(
    () => plural(selectedCount, "customer", "customers"),
    [selectedCount]
  )

  const toggleRecipient = useCallback((email: string, checked: boolean) => {
    hasManualSelectionRef.current = true

    setSelectedEmails((current) => {
      const normalized = normalizeEmailKey(email)
      const mapping = new Map(current.map((item) => [normalizeEmailKey(item), item]))

      if (checked) {
        mapping.set(normalized, email.trim())
      } else {
        mapping.delete(normalized)
      }

      return Array.from(mapping.values())
    })
  }, [])

  const selectAllRecipients = useCallback(() => {
    hasManualSelectionRef.current = true
    setSelectedEmails(uniqueEmails(recipients.map((recipient) => recipient.email)))
  }, [recipients])

  const selectFilteredRecipients = useCallback(() => {
    hasManualSelectionRef.current = true

    setSelectedEmails((current) => {
      const mapping = new Map(current.map((item) => [normalizeEmailKey(item), item]))

      for (const recipient of filteredRecipients) {
        const trimmedEmail = recipient.email.trim()
        if (!trimmedEmail) continue
        mapping.set(normalizeEmailKey(trimmedEmail), trimmedEmail)
      }

      return Array.from(mapping.values())
    })
  }, [filteredRecipients])

  const clearFilteredRecipients = useCallback(() => {
    hasManualSelectionRef.current = true

    const filteredKeys = new Set(
      filteredRecipients.map((recipient) => normalizeEmailKey(recipient.email))
    )

    setSelectedEmails((current) =>
      current.filter((email) => !filteredKeys.has(normalizeEmailKey(email)))
    )
  }, [filteredRecipients])

  const clearSelection = useCallback(() => {
    hasManualSelectionRef.current = true
    setSelectedEmails([])
  }, [])

  const handleSend = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const normalizedSubject = subject.trim()
      const normalizedMessage = message.trim()

      if (!normalizedSubject) {
        setError("Campaign subject is required.")
        return
      }

      if (!normalizedMessage) {
        setError("Campaign message is required.")
        return
      }

      if (selectedCount <= 0) {
        setError("Select at least one customer before sending this campaign.")
        return
      }

      const shouldSend = window.confirm(`Send this campaign to ${selectedLabel}?`)
      if (!shouldSend) return

      setSending(true)
      setError("")
      setActionMessage("")

      try {
        const response = await fetch("/api/marketing/bulk-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: normalizedSubject,
            offerTitle: offerTitle.trim(),
            message: normalizedMessage,
            selectedEmails,
          }),
        })

        const payload = (await response.json().catch(() => null)) as
          | SendResponse
          | null

        if (response.status === 401) {
          router.replace("/admin-login")
          return
        }

        if (!response.ok) {
          throw new Error(
            payload?.message || payload?.error || "Failed to send campaign."
          )
        }

        const sentCount =
          Number.isFinite(payload?.sentCount) && payload?.sentCount
            ? Number(payload.sentCount)
            : selectedCount

        setActionMessage(
          payload?.message ||
            `Marketing campaign sent to ${sentCount} customer${
              sentCount === 1 ? "" : "s"
            }.`
        )
        setLastSentAt(Date.now())
        await refreshAudience()
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : "Failed to send campaign."
        setError(messageText)
      } finally {
        setSending(false)
      }
    },
    [
      message,
      offerTitle,
      refreshAudience,
      router,
      selectedCount,
      selectedEmails,
      selectedLabel,
      setActionMessage,
      setError,
      subject,
    ]
  )

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Audience Size
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{audienceCount}</p>
          <p className="mt-1 text-sm text-zinc-500">Unique customer emails available</p>
        </article>

        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Selected Customers
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{selectedCount}</p>
          <p className="mt-1 text-sm text-zinc-500">Campaign will send to selected list</p>
        </article>

        <article className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8f7f4_100%)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Last Campaign
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-900">
            {lastSentAt > 0 ? formatDateTime(lastSentAt) : "Not sent yet"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Campaign timestamp</p>
        </article>
      </section>

      {!configured ? (
        <section className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <p>
              Bulk marketing email is disabled because `RESEND_API_KEY` is not set in
              the environment.
            </p>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[24px] border border-zinc-300 bg-white/95 p-5 shadow-[0_24px_56px_-42px_rgba(0,0,0,0.75)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Campaign Builder
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                Send bulk mail to selected customers
              </h2>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => void refreshAudience()}
              disabled={loadingAudience || sending}
              className="h-10 rounded-xl border-zinc-300 bg-white text-zinc-900 shadow-none hover:bg-zinc-100 hover:text-zinc-900"
            >
              <RefreshCw className={`h-4 w-4 ${loadingAudience ? "animate-spin" : ""}`} />
              Refresh Audience
            </Button>
          </div>

          <form onSubmit={handleSend} className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-800" htmlFor="campaign-subject">
                Email subject
              </label>
              <Input
                id="campaign-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={160}
                placeholder="Special offer from Phone Garage"
                className="h-11 border-zinc-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-800" htmlFor="campaign-offer-title">
                Offer title (optional)
              </label>
              <Input
                id="campaign-offer-title"
                value={offerTitle}
                onChange={(event) => setOfferTitle(event.target.value)}
                maxLength={140}
                placeholder="Free check-up + discounted screen repair"
                className="h-11 border-zinc-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-800" htmlFor="campaign-message">
                Message
              </label>
              <Textarea
                id="campaign-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={8000}
                placeholder="Write your offer or customer announcement..."
                rows={10}
                className="min-h-[210px] border-zinc-300"
              />
            </div>

            <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 text-sm text-zinc-600">
              <p className="font-semibold text-zinc-900">Campaign audience: {audienceLabel}</p>
              <p className="mt-1">Selected recipients: {selectedLabel}</p>
              <p className="mt-1">
                This campaign will send only to the selected customers from quote and
                booking requests.
              </p>
            </div>

            <Button
              type="submit"
              disabled={disableSend}
              className="h-11 rounded-xl bg-zinc-900 px-5 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-zinc-800"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending Campaign..." : "Send To Selected Customers"}
            </Button>
          </form>
        </article>

        <article className="rounded-[24px] border border-zinc-300 bg-white/95 p-5 shadow-[0_24px_56px_-42px_rgba(0,0,0,0.75)]">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Select Customers
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">
            Choose who receives this campaign
          </h2>

          <div className="mt-4 space-y-2">
            <Input
              value={recipientSearch}
              onChange={(event) => setRecipientSearch(event.target.value)}
              placeholder="Search by name or email"
              className="h-10 border-zinc-300"
            />

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={selectAllRecipients}
                disabled={loadingAudience || recipients.length === 0}
                className="h-9 rounded-xl border-zinc-300 bg-white text-xs font-semibold uppercase tracking-[0.08em] text-zinc-800 hover:bg-zinc-100"
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearSelection}
                disabled={loadingAudience || selectedCount === 0}
                className="h-9 rounded-xl border-zinc-300 bg-white text-xs font-semibold uppercase tracking-[0.08em] text-zinc-800 hover:bg-zinc-100"
              >
                Clear All
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={selectFilteredRecipients}
                disabled={loadingAudience || filteredRecipients.length === 0}
                className="h-9 rounded-xl border-zinc-300 bg-white text-xs font-semibold uppercase tracking-[0.08em] text-zinc-800 hover:bg-zinc-100"
              >
                Select Filtered
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilteredRecipients}
                disabled={loadingAudience || filteredRecipients.length === 0}
                className="h-9 rounded-xl border-zinc-300 bg-white text-xs font-semibold uppercase tracking-[0.08em] text-zinc-800 hover:bg-zinc-100"
              >
                Clear Filtered
              </Button>
            </div>
          </div>

          {loadingAudience ? (
            <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
              Loading audience...
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
              No customers match your search.
            </div>
          ) : (
            <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {filteredRecipients.map((recipient) => {
                const checked = selectedEmailSet.has(normalizeEmailKey(recipient.email))

                return (
                  <label
                    key={recipient.email}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        toggleRecipient(recipient.email, event.target.checked)
                      }
                      className="mt-1 h-4 w-4 rounded border-zinc-400 accent-zinc-900"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {displayText(recipient.customerName, "Customer")}
                      </p>
                      <p className="truncate text-sm text-zinc-600">{recipient.email}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {plural(recipient.bookingCount, "request", "requests")} • Last seen {" "}
                        {formatDateTime(recipient.lastSeenAt)}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          )}

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <UsersRound className="h-4 w-4 text-zinc-700" />
                Audience
              </div>
              <p className="mt-1 text-sm text-zinc-600">{audienceLabel}</p>
            </div>

            <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <MailCheck className="h-4 w-4 text-zinc-700" />
                Selected
              </div>
              <p className="mt-1 text-sm text-zinc-600">{selectedLabel}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 text-sm text-zinc-600">
            <div className="flex items-center gap-2 text-zinc-700">
              <Megaphone className="h-4 w-4" />
              <p className="font-semibold">Use this for offers and announcements</p>
            </div>
            <p className="mt-1">
              Keep messages concise and relevant so customers recognize your offer.
            </p>
          </div>
        </article>
      </section>
    </div>
  )
}
