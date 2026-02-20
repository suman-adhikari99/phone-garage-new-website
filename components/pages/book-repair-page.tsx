"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, type CSSProperties, type FormEvent } from "react"
import { AnimatedSection } from "../animated-section"
import { Shield, Clock, Award, Phone, Mail, MapPin, ArrowLeft, Building2, User, ChevronUp, ChevronDown, CalendarDays } from "lucide-react"
import { Calendar } from "../ui/calendar"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"

const benefits = [
  { icon: Clock, text: "Same-day repairs available" },
  { icon: Shield, text: "12-month warranty on all repairs" },
  { icon: Award, text: "Premium quality parts guaranteed" },
]

const hourOptions = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
const minuteOptions = ["00", "15", "30", "45"]

function BookRepairContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const brand = searchParams.get("brand") || undefined
  const model = searchParams.get("model") || undefined
  const serviceId = searchParams.get("serviceId") || undefined
  const serviceSlug = searchParams.get("serviceSlug") || undefined
  const serviceName = searchParams.get("serviceName") || undefined
  const brandName = searchParams.get("brandName") || undefined
  const modelName = searchParams.get("modelName") || undefined
  const cost = searchParams.get("cost") || undefined
  const time = searchParams.get("time") || undefined

  const hasPreselection = !!(brand && model && serviceName)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [hour, setHour] = useState("09")
  const [minute, setMinute] = useState("30")
  const [meridiem, setMeridiem] = useState<"am" | "pm">("am")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [storeLocation, setStoreLocation] = useState("")
  const [issueNotes, setIssueNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [savedBookingRef, setSavedBookingRef] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const selectedTime = `${hour}:${minute} ${meridiem}`

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push("/")
  }

  const shiftOption = (
    options: string[],
    value: string,
    setter: (val: string) => void,
    direction: 1 | -1
  ) => {
    const idx = options.indexOf(value)
    const next = (idx + direction + options.length) % options.length
    setter(options[next])
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedDate) {
      setFormError("Please choose an appointment date.")
      return
    }

    setFormError("")
    setSubmitted(false)
    setSavedBookingRef(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandId: brand || null,
          brandName: brandName || null,
          modelId: model || null,
          modelName: modelName || null,
          serviceId: serviceId || null,
          serviceSlug: serviceSlug || null,
          serviceName: serviceName || null,
          estimatedCost: cost || null,
          estimatedTime: time || null,
          appointmentDate: selectedDate.toISOString(),
          appointmentTime: selectedTime,
          storeLocation,
          customerName: fullName,
          customerPhone: phone,
          customerEmail: email,
          company: company || null,
          issueNotes: issueNotes || null,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; bookingRef?: string }
        | null

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to save booking. Please try again.")
      }

      const bookingRef = payload?.bookingRef || null
      setSubmitted(true)
      setSavedBookingRef(bookingRef)

      window.alert(
        bookingRef
          ? `Booking submitted successfully. Reference: ${bookingRef}`
          : "Booking submitted successfully."
      )
      router.push("/")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save booking. Please try again."
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "Not selected"
  const sketchFont = { fontFamily: "'Lugrasimo', cursive" }
  const detailsNotebookStyle: CSSProperties = {
    backgroundColor: "#fcfcfd",
    backgroundImage:
      "repeating-linear-gradient(to bottom, transparent 0, transparent 35px, rgba(100,116,139,0.12) 35px, rgba(100,116,139,0.12) 36px)",
  }

  return (
    <div>
      {/* Hero strip */}
      <section className="border-b border-border py-8 lg:py-14">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <div className="mb-4 flex justify-start sm:mb-5">
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            </div>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {hasPreselection ? "Complete Your Booking" : "Book a Repair"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              {hasPreselection
                ? "Your repair details are ready. Pick a store and enter your details to confirm."
                : "Select your service and device — most repairs are done same-day with a 12-month warranty."
              }
            </p>
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <div className="mt-5 flex flex-col items-center gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <b.icon className="h-4 w-4 text-primary shrink-0" />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main content — appointment layout */}
      <section className="py-8 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="bg-[#e7e7e7] px-5 py-2.5 text-[2.15rem] font-semibold leading-none text-black sm:text-[2.6rem]" style={sketchFont}>
                  Booking summary
                </div>
                <div className="space-y-4 p-4.5 sm:p-5">
                  <p className="text-[0.95rem] font-medium text-foreground sm:text-[1.1rem]" style={sketchFont}>Review and confirm your booking below</p>

                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <div className="rounded-lg border-2 border-[#222222] bg-background px-2 py-1.5">
                      <p className="text-[0.74rem] text-[#111111] sm:text-[0.82rem]" style={sketchFont}>Brand :</p>
                      <p className="mt-0.5 text-[0.78rem] font-semibold text-foreground sm:text-[0.86rem]" style={sketchFont}>{brandName || "Device"}</p>
                    </div>
                    <div className="rounded-lg border-2 border-[#222222] bg-background px-2 py-1.5">
                      <p className="text-[0.74rem] text-[#111111] sm:text-[0.82rem]" style={sketchFont}>Model :</p>
                      <p className="mt-0.5 text-[0.78rem] font-semibold text-foreground sm:text-[0.86rem]" style={sketchFont}>{modelName || "Not selected"}</p>
                    </div>
                  </div>

                  <div className="grid gap-1.5 sm:grid-cols-[1fr_auto]">
                    <div className="rounded-lg border-2 border-[#222222] bg-background px-2 py-1.5">
                      <p className="text-[0.74rem] text-[#111111] sm:text-[0.82rem]" style={sketchFont}>Service Required :</p>
                      <p className="mt-0.5 text-[0.78rem] font-semibold text-foreground sm:text-[0.86rem]" style={sketchFont}>{serviceName || "General Repair"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 sm:w-[228px]">
                      <div className="rounded-lg bg-[#ececec] px-1.5 py-1.5 text-center">
                        <p className="text-[0.72rem] text-[#111111]" style={sketchFont}>estimated time</p>
                        <p className="mt-0.5 text-[0.9rem] font-semibold text-[#111111]" style={sketchFont}>{time || "call"}</p>
                      </div>
                      <div className="rounded-lg bg-[#e7e7e7] px-1.5 py-1.5 text-center">
                        <p className="text-[0.72rem] text-black/90" style={sketchFont}>estimated cost</p>
                        <p className="mt-0.5 text-[0.9rem] font-semibold text-black" style={sketchFont}>call</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-center text-[0.95rem] font-semibold text-[#111111] sm:text-[1.1rem]" style={sketchFont}>Select date and time</h3>

                  <div className="rounded-md border border-[#dddddd] bg-[#f7f7f7] p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                      className="mx-auto w-full p-0 [--cell-size:1.75rem] sm:[--cell-size:2.45rem]"
                      classNames={{
                        root: "w-full",
                        months: "relative w-full",
                        month: "w-full min-w-0 gap-0",
                        month_grid: "w-full",
                        table: "w-full table-fixed border-collapse",
                        month_caption:
                          "relative z-10 flex h-[2rem] items-center justify-center rounded-none bg-[#ececec] px-8 sm:h-[2.75rem]",
                        caption_label:
                          "w-full text-center text-[0.9rem] font-semibold text-[#111111] sm:text-[1rem]",
                        nav: "absolute inset-x-0 top-0 z-20 flex h-[2rem] items-center justify-between px-2 sm:h-[2.75rem] sm:px-4",
                        button_previous:
                          "pointer-events-auto h-8 w-8 rounded-none border-0 bg-transparent p-0 text-[#444444] hover:bg-transparent hover:text-[#111111] [&>svg]:size-7 [&>svg]:stroke-[2.2] sm:h-10 sm:w-10 sm:[&>svg]:size-10",
                        button_next:
                          "pointer-events-auto h-8 w-8 rounded-none border-0 bg-transparent p-0 text-[#444444] hover:bg-transparent hover:text-[#111111] [&>svg]:size-7 [&>svg]:stroke-[2.2] sm:h-10 sm:w-10 sm:[&>svg]:size-10",
                        weekday:
                          "flex h-8 items-center justify-center text-center text-[0.78rem] font-semibold text-[#222222] sm:h-10 sm:text-[0.98rem]",
                        day_button:
                          "h-[var(--cell-size)] min-w-0 w-full rounded-none text-[0.78rem] font-medium text-[#222222] hover:bg-[#efefef] data-[selected-single=true]:bg-[#ececec] data-[selected-single=true]:text-[#111111] sm:text-[0.95rem]",
                        selected:
                          "relative overflow-hidden rounded-[0.6rem] bg-[#dcdcdc] text-black after:absolute after:bottom-[2px] after:right-[2px] after:h-0 after:w-0 after:border-l-[0.65rem] after:border-l-transparent after:border-b-[0.65rem] after:border-b-black/80 after:content-['']",
                        today: "bg-transparent text-[#111111]",
                        day: "p-0",
                        weekdays: "mt-0 grid w-full grid-cols-7 border-b border-[#dddddd] bg-[#f7f7f7]",
                        weeks: "w-full",
                        week: "mt-0 grid w-full grid-cols-7",
                      }}
                    />
                  </div>

                  <div className="mx-auto flex w-full max-w-[27rem] flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                    <div className="w-full max-w-[15rem] shrink-0 rounded-md border border-[#dddddd] bg-[#f7f7f7] p-1.5">
                      <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => shiftOption(hourOptions, hour, setHour, 1)}
                            className="rounded-md p-0.5 text-[#444444] hover:bg-[#efefef]"
                            aria-label="Increase hour"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <div className="w-full rounded-[0.75rem] bg-[#ececec] px-2.5 py-1.5 text-center text-[1.65rem] font-semibold leading-none text-[#111111] sm:text-[1.9rem]">
                            {hour}
                          </div>
                          <button
                            type="button"
                            onClick={() => shiftOption(hourOptions, hour, setHour, -1)}
                            className="rounded-md p-0.5 text-[#444444] hover:bg-[#efefef]"
                            aria-label="Decrease hour"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-[1.65rem] font-semibold leading-none text-[#111111] sm:text-[1.9rem]">:</div>

                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => shiftOption(minuteOptions, minute, setMinute, 1)}
                            className="rounded-md p-0.5 text-[#444444] hover:bg-[#efefef]"
                            aria-label="Increase minute"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <div className="w-full rounded-[0.75rem] bg-[#ececec] px-2.5 py-1.5 text-center text-[1.65rem] font-semibold leading-none text-[#111111] sm:text-[1.9rem]">
                            {minute}
                          </div>
                          <button
                            type="button"
                            onClick={() => shiftOption(minuteOptions, minute, setMinute, -1)}
                            className="rounded-md p-0.5 text-[#444444] hover:bg-[#efefef]"
                            aria-label="Decrease minute"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setMeridiem((p) => (p === "am" ? "pm" : "am"))}
                          className="rounded-[0.75rem] bg-[#e0e0e0] px-2.5 py-1.5 text-[1.15rem] font-semibold lowercase leading-none text-black sm:text-[1.35rem]"
                        >
                          {meridiem}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-secondary/50 px-3 py-2.5 sm:min-w-[205px] sm:self-center">
                      <p className="flex items-center gap-2 text-[1rem] font-medium leading-tight text-foreground sm:text-[1.05rem]">
                        <CalendarDays className="h-4 w-4 text-[#111111]" />
                        {formattedDate}
                      </p>
                      <p className="mt-1.5 flex items-center gap-2 text-[1rem] font-medium leading-tight text-foreground sm:text-[1.05rem]">
                        <Clock className="h-4 w-4 text-[#111111]" />
                        {selectedTime},
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-[#d7dce2] bg-[#fcfcfd] shadow-[0_12px_32px_-24px_rgba(15,23,42,0.45)]">
                  <div className="border-b border-[#cfd5dd] bg-[#e7e7e7] px-5 py-2.5 text-[2.15rem] font-semibold leading-none text-black sm:text-[2.6rem]" style={sketchFont}>
                    Details
                  </div>
                  <div className="space-y-3.5 p-4 pl-11 sm:p-4.5 sm:pl-12" style={detailsNotebookStyle}>
                  <p className="text-[1.3rem] font-semibold text-[#374151] sm:text-[1.55rem]" style={sketchFont}>Fill your Details</p>

                  <div className="space-y-1.5">
                    <Label htmlFor="storeLocation" className="sr-only">Store location</Label>
                    <div className="flex items-center gap-3 rounded-lg border border-[#6b7280]/60 bg-white/80 px-3 py-1">
                      <MapPin className="h-5 w-5 text-[#4b5563]" />
                      <Input
                        id="storeLocation"
                        value={storeLocation}
                        onChange={(e) => setStoreLocation(e.target.value)}
                        placeholder="STORE LOCATION"
                        className="h-9 border-0 text-[0.95rem] shadow-none focus-visible:ring-0 sm:text-[1rem]"
                        style={sketchFont}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="sr-only">Full name</Label>
                    <div className="flex items-center gap-3 border-b border-[#6b7280]/60 px-1 pb-2">
                      <User className="h-5 w-5 text-[#4b5563]" />
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="h-9 border-0 bg-transparent px-0 text-[0.95rem] shadow-none focus-visible:ring-0 sm:text-[1rem]" style={sketchFont} required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="sr-only">Phone number</Label>
                    <div className="flex items-center gap-3 border-b border-[#6b7280]/60 px-1 pb-2">
                      <Phone className="h-5 w-5 text-[#4b5563]" />
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="h-9 border-0 bg-transparent px-0 text-[0.95rem] shadow-none focus-visible:ring-0 sm:text-[1rem]" style={sketchFont} required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="sr-only">Company</Label>
                    <div className="flex items-center gap-3 border-b border-[#6b7280]/60 px-1 pb-2">
                      <Building2 className="h-5 w-5 text-[#4b5563]" />
                      <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="h-9 border-0 bg-transparent px-0 text-[0.95rem] shadow-none focus-visible:ring-0 sm:text-[1rem]" style={sketchFont} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="sr-only">Email</Label>
                    <div className="flex items-center gap-3 border-b border-[#6b7280]/60 px-1 pb-2">
                      <Mail className="h-5 w-5 text-[#4b5563]" />
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-9 border-0 bg-transparent px-0 text-[0.95rem] shadow-none focus-visible:ring-0 sm:text-[1rem]" style={sketchFont} required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issueNotes" className="sr-only">Comments</Label>
                    <Textarea
                      id="issueNotes"
                      rows={14}
                      placeholder="Comments / Remarks"
                      value={issueNotes}
                      onChange={(e) => setIssueNotes(e.target.value)}
                      className="border-[#6b7280]/60 bg-white/80 text-[0.95rem] sm:text-[1rem]"
                      style={sketchFont}
                    />
                  </div>

                  {formError && (
                    <p className="text-sm font-medium text-destructive">{formError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 w-full rounded-lg border border-[#cfd5dd] bg-[#e7e7e7] text-sm text-black hover:bg-[#dcdcdc] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "SAVING..." : "BOOK NOW"}
                  </Button>

                  {submitted && (
                    <div className="rounded-xl border border-[#6b7280]/30 bg-[#6b7280]/10 p-4">
                      <p className="text-sm text-muted-foreground">
                        Thanks {fullName || "there"}, we have your request for {formattedDate} at {selectedTime}. Our team will confirm shortly.
                      </p>
                      {savedBookingRef && (
                        <p className="mt-2 text-xs font-semibold text-[#111111]">
                          Booking Ref: {savedBookingRef}
                        </p>
                      )}
                    </div>
                  )}

                  </div>
                </div>

              </div>
            </form>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

export function BookRepairPage() {
  return (
    <Suspense fallback={
      <div className="py-12 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="h-96 animate-pulse rounded-2xl bg-secondary/50" />
        </div>
      </div>
    }>
      <BookRepairContent />
    </Suspense>
  )
}
