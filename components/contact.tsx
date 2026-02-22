"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import {
  Phone,
  Mail,
  Clock,
  Send,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
  Upload,
  X,
  CheckCircle2,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  BatteryCharging,
  Droplets,
  PlugZap,
  Camera,
  Cpu,
  CircleHelp,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { getBrandsByCategory, models, type DeviceCategory } from "@/lib/data"

const quoteHighlights = [
  { icon: Clock, label: "10-min response" },
  { icon: ShieldCheck, label: "Warranty-backed repairs" },
  { icon: Sparkles, label: "Transparent pricing" },
]

type QuoteStep = 1 | 2 | 3 | 4 | 5

const quoteStepLabels = ["Device", "Brand", "Model", "Issues", "Your Details"]

const deviceOptions: { id: DeviceCategory; label: string; description: string; icon: LucideIcon }[] = [
  { id: "mobile", label: "Phone", description: "iPhone, Samsung, Google and more", icon: Smartphone },
  { id: "tablet", label: "Tablet", description: "iPad and Android tablets", icon: Tablet },
  { id: "laptop", label: "Laptop", description: "MacBook, Dell, HP, Lenovo and more", icon: Laptop },
]

const issueOptions: { value: string; label: string; description: string; icon: LucideIcon }[] = [
  { value: "screen", label: "Cracked Screen", description: "Display replacement and calibration", icon: Monitor },
  { value: "battery", label: "Battery Replacement", description: "Low health or draining fast", icon: BatteryCharging },
  { value: "water", label: "Water Damage", description: "Liquid diagnostics and recovery", icon: Droplets },
  { value: "charging", label: "Charging Port", description: "Loose or non-charging connector", icon: PlugZap },
  { value: "camera", label: "Camera Repair", description: "Blur, shake, or no image", icon: Camera },
  { value: "software", label: "Software Issue", description: "Boot loop, lag, update errors", icon: Cpu },
  { value: "other", label: "Other Problem", description: "Tell us your exact issue", icon: CircleHelp },
]

const brandLogoCdn: Record<string, string> = {
  apple: "https://cdn.simpleicons.org/apple/000000",
  samsung: "https://cdn.simpleicons.org/samsung/000000",
  google: "https://cdn.simpleicons.org/google/000000",
  huawei: "https://cdn.simpleicons.org/huawei/000000",
  oppo: "https://cdn.simpleicons.org/oppo/000000",
  xiaomi: "https://cdn.simpleicons.org/xiaomi/000000",
  oneplus: "https://cdn.simpleicons.org/oneplus/000000",
  nokia: "https://cdn.simpleicons.org/nokia/000000",
  motorola: "https://cdn.simpleicons.org/motorola/000000",
  sony: "https://cdn.simpleicons.org/sony/000000",
  ipad: "https://cdn.simpleicons.org/apple/000000",
  "samsung-tab": "https://cdn.simpleicons.org/samsung/000000",
  macbook: "https://cdn.simpleicons.org/apple/000000",
  dell: "https://cdn.simpleicons.org/dell/000000",
  hp: "https://cdn.simpleicons.org/hp/000000",
  lenovo: "https://cdn.simpleicons.org/lenovo/000000",
  asus: "https://cdn.simpleicons.org/asus/000000",
  acer: "https://cdn.simpleicons.org/acer/000000",
  msi: "https://cdn.simpleicons.org/msi/000000",
}

function createSubmissionIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `quote-${crypto.randomUUID()}`
  }

  return `quote-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidPhoneDigits(value: string) {
  return /^\d{8,15}$/.test(value)
}

export function Contact() {
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation()
  const [step, setStep] = useState<QuoteStep>(1)
  const [selectedDevice, setSelectedDevice] = useState<DeviceCategory | "">("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [emailAddress, setEmailAddress] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [savedBookingRef, setSavedBookingRef] = useState<string | null>(null)
  const [conditionImages, setConditionImages] = useState<File[]>([])
  const [conditionImagePreviews, setConditionImagePreviews] = useState<string[]>([])

  const availableBrands = selectedDevice ? getBrandsByCategory(selectedDevice) : []
  const availableModels = selectedBrand ? models.filter((model) => model.brandId === selectedBrand) : []
  const selectedDeviceMeta = selectedDevice ? deviceOptions.find((device) => device.id === selectedDevice) : null
  const selectedBrandName = availableBrands.find((brand) => brand.id === selectedBrand)?.name || ""
  const selectedModelName = availableModels.find((model) => model.id === selectedModel)?.name || ""
  const selectedIssueMetas = issueOptions.filter((issue) =>
    selectedIssues.includes(issue.value)
  )
  const selectedIssueNames = selectedIssueMetas.map((issue) => issue.label)
  const primarySelectedIssueMeta = selectedIssueMetas[0] || null
  const selectedIssueLabel = selectedIssueNames.join(", ")

  useEffect(() => {
    const nextUrls = conditionImages.map((file) => URL.createObjectURL(file))
    setConditionImagePreviews(nextUrls)

    return () => {
      nextUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [conditionImages])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    )
    setConditionImages(selected.slice(0, 4))
  }

  const removeImageAt = (index: number) => {
    setConditionImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeviceSelect = (device: DeviceCategory) => {
    setSelectedDevice(device)
    setSelectedBrand("")
    setSelectedModel("")
    setSelectedIssues([])
  }

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId)
    setSelectedModel("")
    setSelectedIssues([])
  }

  const handleIssueToggle = (issueValue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issueValue)
        ? prev.filter((value) => value !== issueValue)
        : [...prev, issueValue]
    )
  }

  const canProceedToNext =
    (step === 1 && !!selectedDevice) ||
    (step === 2 && !!selectedBrand) ||
    (step === 3 && !!selectedModel) ||
    (step === 4 && selectedIssues.length > 0)

  const goToNextStep = () => {
    if (!canProceedToNext || step >= 5) return
    setStep((prev) => (prev + 1) as QuoteStep)
  }

  const goToPreviousStep = () => {
    if (step <= 1) return
    setStep((prev) => (prev - 1) as QuoteStep)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !phoneNumber.trim()) {
      setSubmitError("Please enter your full name and phone number.")
      return
    }
    if (!isValidPhoneDigits(phoneNumber.trim())) {
      setSubmitError("Phone number must contain only digits (8-15).")
      return
    }
    if (emailAddress.trim() && !isValidEmail(emailAddress.trim())) {
      setSubmitError("Please enter a valid email address or leave it empty.")
      return
    }

    setSubmitError("")
    setSavedBookingRef(null)
    setSubmitted(false)
    setIsSubmitting(true)

    const quoteSummary = [
      "Submission source: Website Quote Form",
      selectedDeviceMeta?.label ? `Device type: ${selectedDeviceMeta.label}` : null,
      selectedBrandName ? `Brand: ${selectedBrandName}` : null,
      selectedModelName ? `Model: ${selectedModelName}` : null,
      selectedIssueNames.length > 0
        ? `Issue type${selectedIssueNames.length > 1 ? "s" : ""}: ${selectedIssueNames.join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n")

    const issueNotes = [
      quoteSummary || null,
      issueDescription.trim()
        ? `Customer description:\n${issueDescription.trim()}`
        : null,
      conditionImages.length > 0
        ? `Uploaded image(s) (${conditionImages.length}): ${conditionImages
            .map((file) => file.name)
            .join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n")

    try {
      const idempotencyKey = createSubmissionIdempotencyKey()
      const formData = new FormData()
      formData.set("brandId", selectedBrand || "")
      formData.set("brandName", selectedBrandName || "")
      formData.set("modelId", selectedModel || "")
      formData.set("modelName", selectedModelName || "")
      formData.set("serviceId", selectedIssues.join(","))
      formData.set("serviceSlug", selectedIssues.join(","))
      formData.set("serviceName", selectedIssueNames.join(", "))
      formData.set("estimatedCost", "")
      formData.set("estimatedTime", "")
      formData.set("appointmentDate", new Date().toISOString())
      formData.set("appointmentTime", "Quote request")
      formData.set("storeLocation", "Website Quote Form")
      formData.set("customerName", fullName)
      formData.set("customerPhone", phoneNumber)
      formData.set("customerEmail", emailAddress || "")
      formData.set("company", "")
      formData.set("issueNotes", issueNotes || "")

      for (const image of conditionImages) {
        formData.append("deviceImages", image)
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        body: formData,
      })

      const payload = (await response.json().catch(() => null)) as
        | { bookingRef?: string; message?: string }
        | null

      if (!response.ok) {
        throw new Error(
          payload?.message || "We could not submit your quote request. Please try again."
        )
      }

      setSavedBookingRef(payload?.bookingRef || null)
      setSubmitted(true)
      const successPath = payload?.bookingRef
        ? `/booking-success?bookingRef=${encodeURIComponent(payload.bookingRef)}`
        : "/booking-success"
      window.location.href = successPath
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not submit your quote request. Please try again."
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="contact"
      className="relative scroll-mt-28 overflow-hidden bg-[radial-gradient(circle_at_8%_12%,rgba(0,0,0,0.08),transparent_34%),radial-gradient(circle_at_92%_78%,rgba(0,0,0,0.06),transparent_40%),linear-gradient(165deg,#ffffff_0%,#f4f5f7_54%,#edf0f3_100%)] py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-black/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-black/5 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:36px_36px] opacity-25" />

      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <div
          ref={formRef}
          className={`transition-all duration-700 ${
            formVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
            <div className="relative overflow-hidden rounded-[34px] border border-zinc-300/80 bg-white/92 p-6 shadow-[0_35px_85px_-42px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-black/6 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-zinc-200/70 blur-2xl" />
              <div className="relative">
                <span className="inline-flex items-center rounded-full border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f2f4f7_100%)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-700 shadow-[0_10px_20px_-16px_rgba(0,0,0,0.7)]">
                  Get A Quote
                </span>
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.8rem]">
                  Tell Us About Your Device
                </h2>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-zinc-600">
                  Share a few details and our team will send a tailored quote fast.
                  Designed for quick booking, clear communication, and zero back-and-forth.
                </p>

                <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
                  {quoteHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 rounded-xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f5f7fa_100%)] px-3 py-2.5 text-sm font-semibold text-zinc-700 shadow-[0_12px_26px_-24px_rgba(0,0,0,0.65)]"
                    >
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-900">
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="rounded-3xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fa_100%)] p-3.5 shadow-[0_20px_36px_-30px_rgba(0,0,0,0.7)] sm:p-4.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-zinc-600 sm:text-sm">
                        Step {step} of {quoteStepLabels.length}
                      </p>
                      <p className="rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-sm font-semibold text-zinc-900">
                        {quoteStepLabels[step - 1]}
                      </p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#111827_0%,#09090b_100%)] transition-all duration-300"
                        style={{ width: `${(step / quoteStepLabels.length) * 100}%` }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2.5">
                      {quoteStepLabels.map((label, index) => {
                        const stepNumber = (index + 1) as QuoteStep
                        const isCurrent = step === stepNumber
                        const isCompleted = step > stepNumber
                        return (
                          <div key={label} className="text-center">
                            <div
                              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all sm:h-9 sm:w-9 ${
                                isCurrent
                                  ? "bg-zinc-900 text-white shadow-[0_12px_20px_-12px_rgba(0,0,0,0.75)] ring-2 ring-white"
                                  : isCompleted
                                    ? "bg-zinc-800 text-white"
                                    : "bg-zinc-300 text-zinc-600"
                              }`}
                            >
                              {isCompleted ? "✓" : stepNumber}
                            </div>
                            <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                              isCurrent ? "text-zinc-900" : "text-zinc-500"
                            }`}>
                              {label}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {step === 1 && (
                    <div className="rounded-3xl border border-zinc-300 bg-white p-4 shadow-[0_20px_40px_-34px_rgba(0,0,0,0.7)] sm:p-5">
                      <div className="mb-4 flex items-start justify-between gap-3 border-b border-zinc-200 pb-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-900">
                            <Smartphone className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Step 1</p>
                            <h3 className="mt-1 text-base font-semibold leading-tight text-zinc-900 sm:text-lg">
                              Choose your device type
                            </h3>
                            <p className="mt-1 text-sm text-zinc-600">
                              Pick one to continue with matching brands and models.
                            </p>
                          </div>
                        </div>
                        <p className="hidden rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 sm:block">
                          3 options
                        </p>
                      </div>

                      <div className="grid gap-3.5 sm:grid-cols-3">
                        {deviceOptions.map((option) => {
                          const isSelected = selectedDevice === option.id
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleDeviceSelect(option.id)}
                              className={`group relative min-h-[160px] rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                                isSelected
                                  ? "border-black bg-[linear-gradient(180deg,#ffffff_0%,#f6f7fa_100%)] text-zinc-900 shadow-[0_24px_34px_-28px_rgba(0,0,0,0.8)]"
                                  : "border-zinc-200 bg-white text-zinc-900 hover:-translate-y-0.5 hover:border-black hover:shadow-[0_18px_28px_-24px_rgba(0,0,0,0.65)]"
                              }`}
                              aria-pressed={isSelected}
                            >
                              <div className="mb-4 flex items-start justify-between gap-2">
                                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${
                                  isSelected
                                    ? "border-black bg-black text-white"
                                    : "border-zinc-300 bg-white text-zinc-700 group-hover:border-black group-hover:text-zinc-900"
                                }`}>
                                  <option.icon className="h-4.5 w-4.5" />
                                </div>
                                {isSelected ? (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-black" />
                                ) : (
                                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900" />
                                )}
                              </div>
                              <p className="text-base font-semibold tracking-tight text-zinc-900">{option.label}</p>
                              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                                {option.description}
                              </p>
                              <div className="mt-4 h-px w-full bg-zinc-200" />
                              <p className={`mt-3 text-xs font-semibold uppercase tracking-[0.11em] ${
                                isSelected ? "text-black" : "text-zinc-500"
                              }`}>{isSelected ? "Selected" : "Select device"}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="rounded-3xl border border-zinc-300 bg-white/95 p-4 shadow-[0_22px_38px_-32px_rgba(0,0,0,0.68)]">
                      <p className="mb-3 text-sm font-semibold text-zinc-900">Select your brand</p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {availableBrands.map((brand) => {
                          const isSelected = selectedBrand === brand.id
                          const logoSrc = brandLogoCdn[brand.id] || brand.image
                          return (
                            <button
                              key={brand.id}
                              type="button"
                              onClick={() => handleBrandSelect(brand.id)}
                              className={`group relative flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all ${
                                isSelected
                                  ? "border-zinc-900 bg-zinc-900 text-white shadow-[0_18px_32px_-20px_rgba(0,0,0,0.7)]"
                                  : "border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f6_100%)] hover:-translate-y-0.5 hover:border-zinc-900"
                              }`}
                            >
                              <div className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${
                                isSelected ? "border-white/20 bg-white" : "border-zinc-300 bg-white"
                              }`}>
                                {logoSrc ? (
                                  <img src={logoSrc} alt={`${brand.name} logo`} className="h-7 w-7 object-contain" loading="lazy" />
                                ) : (
                                  <span className="text-sm font-bold text-zinc-900">{brand.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className={`truncate text-sm font-semibold ${isSelected ? "text-white" : "text-zinc-900"}`}>{brand.name}</p>
                                <p className={`mt-0.5 text-sm ${isSelected ? "text-zinc-200" : "text-zinc-600"}`}>{brand.modelCount}+ models</p>
                              </div>
                              {isSelected && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-white" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="rounded-3xl border border-zinc-300 bg-white/95 p-4 shadow-[0_22px_38px_-32px_rgba(0,0,0,0.68)]">
                      <p className="mb-3 text-sm font-semibold text-zinc-900">Select your model</p>
                      <div className="grid max-h-[290px] gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                        {availableModels.map((model) => {
                          const isSelected = selectedModel === model.id
                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => {
                                setSelectedModel(model.id)
                                setSelectedIssues([])
                              }}
                              className={`relative rounded-xl border px-4 py-3 text-left transition-all ${
                                isSelected
                                  ? "border-zinc-900 bg-zinc-900 text-white shadow-[0_14px_28px_-22px_rgba(0,0,0,0.65)]"
                                  : "border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f6_100%)] hover:border-zinc-900"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-zinc-900"}`}>{model.name}</p>
                                {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />}
                              </div>
                              <p className={`mt-1 text-sm ${isSelected ? "text-zinc-200" : "text-zinc-600"}`}>Release {model.year}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="rounded-3xl border border-zinc-300 bg-white/95 p-4 shadow-[0_22px_38px_-32px_rgba(0,0,0,0.68)]">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-zinc-900">Choose issue type(s)</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                          {selectedIssues.length} selected
                        </p>
                      </div>
                      <p className="mb-3 text-sm text-zinc-600">
                        You can select multiple issues for the same device.
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {issueOptions.map((issue) => {
                          const isSelected = selectedIssues.includes(issue.value)
                          return (
                            <button
                              key={issue.value}
                              type="button"
                              onClick={() => handleIssueToggle(issue.value)}
                              className={`relative flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                                isSelected
                                  ? "border-zinc-900 bg-zinc-900 text-white shadow-[0_14px_28px_-20px_rgba(0,0,0,0.65)]"
                                  : "border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f6_100%)] hover:-translate-y-0.5 hover:border-zinc-900"
                              }`}
                            >
                              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                                isSelected
                                  ? "border-white/20 bg-white text-zinc-900"
                                  : "border-zinc-300 bg-white text-zinc-600"
                              }`}>
                                <issue.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-zinc-900"}`}>{issue.label}</p>
                                <p className={`mt-1 text-sm ${isSelected ? "text-zinc-200" : "text-zinc-600"}`}>{issue.description}</p>
                              </div>
                              {isSelected && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-white" />}
                            </button>
                          )
                        })}
                      </div>
                      {selectedIssueNames.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedIssueNames.map((label) => (
                            <span
                              key={label}
                              className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-700"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="rounded-3xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f6_100%)] p-4 shadow-[0_18px_30px_-24px_rgba(0,0,0,0.6)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">Selected Repair</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div className="flex items-center gap-2 text-sm text-zinc-800">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-900 shadow-sm">
                              {selectedDeviceMeta ? <selectedDeviceMeta.icon className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                            </div>
                            <span><span className="font-semibold">Device:</span> {selectedDeviceMeta?.label || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-800">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-900 shadow-sm">
                              <Sparkles className="h-4 w-4" />
                            </div>
                            <span><span className="font-semibold">Brand:</span> {selectedBrandName || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-800">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-900 shadow-sm">
                              <Cpu className="h-4 w-4" />
                            </div>
                            <span><span className="font-semibold">Model:</span> {selectedModelName || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-800">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-900 shadow-sm">
                              {primarySelectedIssueMeta ? (
                                <primarySelectedIssueMeta.icon className="h-4 w-4" />
                              ) : (
                                <CircleHelp className="h-4 w-4" />
                              )}
                            </div>
                            <span><span className="font-semibold">Issue(s):</span> {selectedIssueLabel || "-"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-zinc-300 bg-white/95 p-4 shadow-[0_22px_38px_-30px_rgba(0,0,0,0.65)]">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="name"
                              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600"
                            >
                              Full Name
                            </label>
                            <div className="relative">
                              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                              <Input
                                id="name"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                placeholder="John Smith"
                                className="h-12 rounded-xl border-zinc-300 bg-white pl-10 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900/10"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="phone"
                              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600"
                            >
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                              <Input
                                id="phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, "").slice(0, 15))}
                                placeholder="0400 000 000"
                                className="h-12 rounded-xl border-zinc-300 bg-white pl-10 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900/10"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={15}
                                required
                              />
                            </div>
                            <p className="mt-1.5 text-sm text-zinc-500">
                              Digits only, 8 to 15 numbers.
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="email"
                            className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600"
                          >
                            Email Address (Optional)
                          </label>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <Input
                              id="email"
                              type="email"
                              value={emailAddress}
                              onChange={(event) => setEmailAddress(event.target.value)}
                              placeholder="john@example.com (optional)"
                              className="h-12 rounded-xl border-zinc-300 bg-white pl-10 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900/10"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="message"
                            className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600"
                          >
                            Description (Optional)
                          </label>
                          <Textarea
                            id="message"
                            value={issueDescription}
                            onChange={(event) => setIssueDescription(event.target.value)}
                            placeholder="Tell us more about the problem with your device..."
                            className="min-h-[120px] rounded-xl border-zinc-300 bg-white text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900/10 resize-none"
                          />
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="condition-images"
                            className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600"
                          >
                            Device Condition Photos (Optional)
                          </label>

                          <label
                            htmlFor="condition-images"
                            className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 transition-colors hover:border-zinc-900 hover:bg-zinc-100"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-zinc-900">Upload clear images of the damage</p>
                              <p className="mt-1 text-sm text-zinc-600">JPG, PNG, WEBP - up to 4 photos</p>
                            </div>
                            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-900 transition-colors group-hover:border-zinc-900">
                              <Upload className="h-4 w-4" />
                            </div>
                          </label>

                          <input
                            id="condition-images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="sr-only"
                          />

                          {conditionImagePreviews.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {conditionImagePreviews.map((preview, index) => (
                                <div key={preview} className="group relative overflow-hidden rounded-xl border border-zinc-300 bg-white">
                                  <img
                                    src={preview}
                                    alt={`Device condition image ${index + 1}`}
                                    className="h-24 w-full object-cover"
                                    loading="lazy"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImageAt(index)}
                                    className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
                                    aria-label={`Remove image ${index + 1}`}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="sticky bottom-0 z-20 -mx-1 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/95 px-2 py-3 backdrop-blur sm:static sm:-mx-0 sm:rounded-none sm:border-x-0 sm:border-b-0 sm:border-t sm:border-zinc-200 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousStep}
                      disabled={step === 1}
                      className="h-11 rounded-xl border-zinc-300 bg-white px-5 text-zinc-900 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      Back
                    </Button>

                    {step < 5 ? (
                      <Button
                        type="button"
                        onClick={goToNextStep}
                        disabled={!canProceedToNext}
                        className="h-11 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-[0_18px_35px_-20px_rgba(0,0,0,0.75)] hover:bg-black disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        size="lg"
                        className="h-11 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-[0_18px_35px_-20px_rgba(0,0,0,0.75)] hover:bg-black disabled:opacity-55"
                        disabled={submitted || isSubmitting}
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : submitted ? (
                          "Quote Request Sent!"
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Request Free Quote
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {submitError && (
                    <p aria-live="polite" className="text-sm font-medium text-red-600">{submitError}</p>
                  )}
                  {submitted && (
                    <p aria-live="polite" className="text-sm font-medium text-zinc-700">
                      Your quote request has been saved successfully
                      {savedBookingRef ? ` (Ref: ${savedBookingRef})` : ""}.
                    </p>
                  )}
                </form>
              </div>
            </div>
        </div>
      </div>
    </section>
  )
}
