"use client"

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Camera,
  Check,
  CircleDot,
  CircleHelp,
  Cpu,
  Database,
  Disc3,
  Droplets,
  Fan,
  FoldVertical,
  Gamepad2,
  HdmiPort,
  ImagePlus,
  Joystick,
  Keyboard,
  Laptop,
  Loader2,
  Mail,
  Monitor,
  Pencil,
  Phone,
  PlugZap,
  Power,
  Search,
  Send,
  Shapes,
  Smartphone,
  Tablet,
  User,
  Watch,
  X,
  type LucideIcon,
} from "lucide-react"
import { getBrandsByCategory, models } from "@/lib/data"
import {
  extraDeviceBrands,
  extraLaptopBrands,
  isExtraDeviceCategory,
  type QuoteBrandOption,
  type QuoteDeviceCategory,
} from "@/lib/quote-devices"

const EASE = [0.22, 1, 0.36, 1] as const
const SERIF = "[font-family:var(--font-display)] font-normal"
const MODEL_SEARCH_THRESHOLD = 8

type QuoteStep = 1 | 2 | 3 | 4 | 5

const deviceOptions: {
  id: QuoteDeviceCategory
  label: string
  description: string
  icon: LucideIcon
}[] = [
  { id: "mobile", label: "Phone", description: "iPhone & Android", icon: Smartphone },
  { id: "tablet", label: "Tablet", description: "iPad & Android", icon: Tablet },
  { id: "laptop", label: "Laptop", description: "MacBook & Windows", icon: Laptop },
  { id: "watch", label: "Smart Watch", description: "Apple, Galaxy, Pixel", icon: Watch },
  { id: "console", label: "Gaming Console", description: "PlayStation, Xbox, Switch", icon: Gamepad2 },
  { id: "other", label: "Other Device", description: "Cameras, audio & more", icon: Shapes },
]

const issueOptions: { value: string; label: string; description: string; icon: LucideIcon }[] = [
  { value: "screen", label: "Cracked Screen", description: "Display replacement and calibration", icon: Monitor },
  { value: "battery", label: "Battery Replacement", description: "Low health or draining fast", icon: BatteryCharging },
  { value: "water", label: "Water Damage", description: "Liquid diagnostics and recovery", icon: Droplets },
  { value: "charging", label: "Charging Port", description: "Loose or non-charging connector", icon: PlugZap },
  { value: "camera", label: "Camera Repair", description: "Blur, shake, or no image", icon: Camera },
  { value: "software", label: "Software Issue", description: "Boot loop, lag, update errors", icon: Cpu },
  { value: "data", label: "Data Recovery", description: "Photos, contacts and files rescued", icon: Database },
  { value: "motherboard", label: "Motherboard / No Power", description: "Board-level and short-circuit faults", icon: Power },
  { value: "buttons", label: "Crown & Buttons", description: "Stuck, loose or unresponsive", icon: CircleDot },
  { value: "hdmi", label: "HDMI Port", description: "No picture or loose HDMI port", icon: HdmiPort },
  { value: "overheating", label: "Overheating & Fan", description: "Loud fan, shutdowns, thermal paste", icon: Fan },
  { value: "disc", label: "Disc Drive", description: "Won't read, eject or load discs", icon: Disc3 },
  { value: "controller", label: "Controller Drift", description: "Stick drift, buttons, charging", icon: Joystick },
  { value: "keyboard", label: "Keyboard & Trackpad", description: "Sticky, dead or repeating keys", icon: Keyboard },
  { value: "hinge", label: "Hinge & Casing", description: "Loose, stiff or snapped hinges", icon: FoldVertical },
  { value: "other", label: "Other Problem", description: "Tell us your exact issue", icon: CircleHelp },
]

const issueValuesByDevice: Record<QuoteDeviceCategory, string[]> = {
  mobile: ["screen", "battery", "water", "charging", "camera", "software", "data", "motherboard", "other"],
  tablet: ["screen", "battery", "water", "charging", "camera", "software", "data", "motherboard", "other"],
  laptop: ["screen", "keyboard", "battery", "charging", "hinge", "overheating", "water", "software", "data", "motherboard", "other"],
  watch: ["screen", "battery", "water", "charging", "buttons", "software", "other"],
  console: ["hdmi", "overheating", "motherboard", "disc", "controller", "software", "other"],
  other: ["screen", "battery", "water", "charging", "motherboard", "data", "other"],
}

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

function getBrandOptions(device: QuoteDeviceCategory): QuoteBrandOption[] {
  if (isExtraDeviceCategory(device)) return extraDeviceBrands[device]
  const catalogued = getBrandsByCategory(device).map((brand) => ({
    id: brand.id,
    name: brand.name,
    logo: brandLogoCdn[brand.id] || brand.image,
    modelCount: brand.modelCount,
    models: models
      .filter((model) => model.brandId === brand.id)
      .map((model) => ({ id: model.id, name: model.name, sub: `Release ${model.year}` })),
  }))
  return device === "laptop" ? [...catalogued, ...extraLaptopBrands] : catalogued
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

function OptionCheck({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
        selected ? "border-[#1f7a26] bg-[#1f7a26] text-white" : "border-zinc-300 bg-white text-transparent"
      }`}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  )
}

function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between text-sm font-medium text-zinc-800">
      {children}
      {optional && <span className="text-xs font-normal text-zinc-500">Optional</span>}
    </label>
  )
}

const inputClass =
  "h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-[15px] text-zinc-900 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-[#1f7a26] focus:ring-4 focus:ring-[#1f7a26]/12 aria-invalid:border-red-400 aria-invalid:bg-red-50/40 aria-invalid:focus:ring-red-400/15"

export function Contact() {
  const reduceMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const hasMountedRef = useRef(false)

  const [step, setStep] = useState<QuoteStep>(1)
  const [direction, setDirection] = useState(1)
  const [selectedDevice, setSelectedDevice] = useState<QuoteDeviceCategory | "">("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [customModelName, setCustomModelName] = useState("")
  const [typingModel, setTypingModel] = useState(false)
  const [modelQuery, setModelQuery] = useState("")
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [emailAddress, setEmailAddress] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [conditionImages, setConditionImages] = useState<File[]>([])
  const [conditionImagePreviews, setConditionImagePreviews] = useState<string[]>([])
  const [preferredIssue, setPreferredIssue] = useState("")

  const availableBrands = selectedDevice ? getBrandOptions(selectedDevice) : []
  const selectedBrandMeta = availableBrands.find((brand) => brand.id === selectedBrand) || null
  const availableModels = selectedBrandMeta?.models ?? []
  const needsCustomModel = !!selectedBrandMeta && (availableModels.length === 0 || typingModel)
  const filteredModels = modelQuery.trim()
    ? availableModels.filter((model) => model.name.toLowerCase().includes(modelQuery.trim().toLowerCase()))
    : availableModels
  const selectedDeviceMeta = selectedDevice ? deviceOptions.find((device) => device.id === selectedDevice) : null
  const selectedBrandName = selectedBrandMeta?.name || ""
  const selectedModelName = needsCustomModel
    ? customModelName.trim()
    : availableModels.find((model) => model.id === selectedModel)?.name || ""
  const visibleIssueOptions = selectedDevice
    ? issueValuesByDevice[selectedDevice]
        .map((value) => issueOptions.find((issue) => issue.value === value))
        .filter((issue): issue is (typeof issueOptions)[number] => Boolean(issue))
    : issueOptions
  const selectedIssueMetas = issueOptions.filter((issue) => selectedIssues.includes(issue.value))
  const selectedIssueNames = selectedIssueMetas.map((issue) => issue.label)
  const quoteStepLabels = [
    "Device",
    selectedDevice === "other" ? "Type" : "Brand",
    "Model",
    "Issues",
    "Your Details",
  ]

  const stepCopy: Record<QuoteStep, { title: string; hint: string }> = {
    1: { title: "What needs fixing?", hint: "Pick the type of device." },
    2: {
      title: selectedDevice === "other" ? "What kind of device is it?" : "Which brand is it?",
      hint: selectedDevice === "other" ? "Choose the closest match." : "Tap your brand to see its models.",
    },
    3: {
      title: needsCustomModel ? "What's the brand and model?" : "Which model do you have?",
      hint: needsCustomModel
        ? "Usually printed on the back, the box or in Settings. Not sure? Just describe it."
        : "Not sure? Pick the closest — we'll confirm in store.",
    },
    4: { title: "What's wrong with it?", hint: "Select everything that applies." },
    5: { title: "Where should we send your quote?", hint: "We usually reply within 10 minutes during opening hours." },
  }

  const nameError = !fullName.trim() ? "Please enter your name." : ""
  const phoneError = !isValidPhoneDigits(phoneNumber.trim()) ? "Enter 8–15 digits, e.g. 0400000000." : ""
  const emailError = !isValidEmail(emailAddress.trim()) ? "Enter a valid email address." : ""

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const issue = issueOptions.find((option) => option.value === params.get("issue"))?.value
    if (issue) setPreferredIssue(issue)

    const device = deviceOptions.find((option) => option.id === params.get("device"))?.id
    if (!device) return

    const brand = getBrandOptions(device).find((option) => option.id === params.get("brand"))?.id
    setSelectedDevice(device)
    if (brand) setSelectedBrand(brand)
    setStep(brand ? 3 : 2)
  }, [])

  useEffect(() => {
    if (step !== 4 || !preferredIssue || !selectedDevice || selectedIssues.length > 0) return
    if (issueValuesByDevice[selectedDevice].includes(preferredIssue)) {
      setSelectedIssues([preferredIssue])
    }
    setPreferredIssue("")
  }, [step, preferredIssue, selectedDevice, selectedIssues.length])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    const panel = panelRef.current
    if (!panel) return
    const top = panel.getBoundingClientRect().top
    if (top < 90 || top > window.innerHeight * 0.6) {
      window.scrollTo({ top: window.scrollY + top - 110, behavior: reduceMotion ? "auto" : "smooth" })
    }
  }, [step, reduceMotion])

  useEffect(() => {
    const nextUrls = conditionImages.map((file) => URL.createObjectURL(file))
    setConditionImagePreviews(nextUrls)

    return () => {
      nextUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [conditionImages])

  const goToStep = (next: QuoteStep) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"))
    setConditionImages((prev) => [...prev, ...selected].slice(0, 4))
    event.target.value = ""
  }

  const removeImageAt = (index: number) => {
    setConditionImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeviceSelect = (device: QuoteDeviceCategory) => {
    if (device !== selectedDevice) {
      setSelectedBrand("")
      setSelectedModel("")
      setCustomModelName("")
      setTypingModel(false)
      setSelectedIssues([])
    }
    setSelectedDevice(device)
    goToStep(2)
  }

  const handleBrandSelect = (brandId: string) => {
    if (brandId !== selectedBrand) {
      setSelectedModel("")
      setCustomModelName("")
      setTypingModel(false)
      setModelQuery("")
      setSelectedIssues([])
    }
    setSelectedBrand(brandId)
    goToStep(3)
  }

  const handleModelSelect = (modelId: string) => {
    if (modelId !== selectedModel) setSelectedIssues([])
    setSelectedModel(modelId)
    goToStep(4)
  }

  const handleIssueToggle = (issueValue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issueValue) ? prev.filter((value) => value !== issueValue) : [...prev, issueValue]
    )
  }

  const isStepComplete = (target: QuoteStep) => {
    if (target === 1) return !!selectedDevice
    if (target === 2) return !!selectedBrand
    if (target === 3) return needsCustomModel ? !!customModelName.trim() : !!selectedModel
    if (target === 4) return selectedIssues.length > 0
    return false
  }

  const canProceedToNext = step < 5 && isStepComplete(step)
  const canVisitStep = (target: QuoteStep) =>
    target <= step || ([1, 2, 3, 4] as QuoteStep[]).filter((s) => s < target).every(isStepComplete)

  const goToNextStep = () => {
    if (!canProceedToNext) return
    goToStep((step + 1) as QuoteStep)
  }

  const goToPreviousStep = () => {
    if (step <= 1) return
    goToStep((step - 1) as QuoteStep)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAttemptedSubmit(true)
    const trimmedFullName = fullName.trim()
    const trimmedPhoneNumber = phoneNumber.trim()
    const trimmedEmailAddress = emailAddress.trim()

    if (nameError || phoneError || emailError) {
      setSubmitError("Please check the highlighted fields.")
      return
    }

    setSubmitError("")
    setSubmitted(false)
    setIsSubmitting(true)

    const quoteSummary = [
      "Submission source: Website Quote Form",
      selectedDeviceMeta?.label ? `Device type: ${selectedDeviceMeta.label}` : null,
      selectedBrandName ? `${quoteStepLabels[1]}: ${selectedBrandName}` : null,
      selectedModelName ? `Model: ${selectedModelName}` : null,
      selectedIssueNames.length > 0
        ? `Issue type${selectedIssueNames.length > 1 ? "s" : ""}: ${selectedIssueNames.join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n")

    const issueNotes = [
      quoteSummary || null,
      issueDescription.trim() ? `Customer description:\n${issueDescription.trim()}` : null,
      conditionImages.length > 0
        ? `Uploaded image(s) (${conditionImages.length}): ${conditionImages.map((file) => file.name).join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n")

    try {
      const idempotencyKey = createSubmissionIdempotencyKey()
      const formData = new FormData()
      formData.set("brandId", selectedBrand || "")
      formData.set("brandName", selectedBrandName || "")
      formData.set("modelId", needsCustomModel ? `custom:${selectedModelName}` : selectedModel || "")
      formData.set("modelName", selectedModelName || "")
      formData.set("serviceId", selectedIssues.join(","))
      formData.set("serviceSlug", selectedIssues.join(","))
      formData.set("serviceName", selectedIssueNames.join(", "))
      formData.set("estimatedCost", "")
      formData.set("estimatedTime", "")
      formData.set("appointmentDate", new Date().toISOString())
      formData.set("appointmentTime", "Quote request")
      formData.set("storeLocation", "Website Quote Form")
      formData.set("submissionSource", "website_quote_form")
      formData.set("customerName", trimmedFullName)
      formData.set("customerPhone", trimmedPhoneNumber)
      formData.set("customerEmail", trimmedEmailAddress)
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
        throw new Error(payload?.message || "We could not submit your quote request. Please try again.")
      }

      setSubmitted(true)
      const successPath = payload?.bookingRef
        ? `/booking-success?bookingRef=${encodeURIComponent(payload.bookingRef)}`
        : "/booking-success"
      window.location.href = successPath
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We could not submit your quote request. Please try again."
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const summaryRows: { step: QuoteStep; label: string; value: string }[] = [
    { step: 1, label: "Device", value: selectedDeviceMeta?.label || "" },
    { step: 2, label: quoteStepLabels[1], value: selectedBrandName },
    { step: 3, label: "Model", value: selectedModelName },
    { step: 4, label: "Issues", value: selectedIssueNames.join(", ") },
  ]

  const panelMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: direction * 28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: direction * -28 },
        transition: { duration: 0.35, ease: EASE },
      }

  return (
    <section id="contact" className="scroll-mt-28 pb-20 lg:pb-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="flex items-center gap-3 text-sm font-medium text-zinc-500">
            <span className="h-px w-10 bg-zinc-400" />
            Free quote · No obligation
          </p>
          <h1 className="mt-5 text-[44px] font-semibold leading-[0.98] tracking-[-2px] text-zinc-950 sm:text-[52px] min-[861px]:text-[58px]">
            Tell us what&apos;s <span className={`${SERIF} italic tracking-[-0.02em] text-[#1f7a26]`}>broken.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
            Five quick steps, about a minute. We&apos;ll come back with an honest price — usually within 10 minutes.
          </p>
        </header>

        <div className="mt-10 lg:mt-12">
          <form onSubmit={handleSubmit} noValidate className="min-w-0">
            <ol className="grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Quote progress">
              {quoteStepLabels.map((label, index) => {
                const stepNumber = (index + 1) as QuoteStep
                const isCurrent = step === stepNumber
                const isDone = step > stepNumber
                const clickable = !isCurrent && canVisitStep(stepNumber)
                return (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => clickable && goToStep(stepNumber)}
                      disabled={!clickable}
                      aria-current={isCurrent ? "step" : undefined}
                      className="group w-full text-left disabled:cursor-default"
                    >
                      <span className="block h-1.5 overflow-hidden rounded-full bg-zinc-300/70">
                        <motion.span
                          className="block h-full rounded-full bg-[#1f7a26]"
                          initial={false}
                          animate={{ width: isDone || isCurrent ? "100%" : "0%" }}
                          transition={{ duration: 0.45, ease: EASE }}
                        />
                      </span>
                      <span
                        className={`mt-2 hidden text-xs font-medium sm:block ${
                          isCurrent ? "text-zinc-950" : isDone ? "text-zinc-600 group-hover:text-[#1f7a26]" : "text-zinc-400"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <p className="mt-3 text-xs font-medium text-zinc-500 sm:hidden">
              Step {step} of 5 · {quoteStepLabels[step - 1]}
            </p>

            {step > 1 && summaryRows.some((row) => row.value) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {summaryRows
                  .filter((row) => row.value && row.step < step)
                  .map((row) => (
                    <button
                      key={row.label}
                      type="button"
                      onClick={() => goToStep(row.step)}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700"
                    >
                      <span className="truncate">{row.value}</span>
                      <Pencil className="h-3 w-3 shrink-0 text-zinc-400" />
                    </button>
                  ))}
              </div>
            )}

            <div
              ref={panelRef}
              className="relative mt-6 overflow-hidden rounded-[28px] bg-white p-5 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.35)] ring-1 ring-black/5 sm:p-8"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${step}-${needsCustomModel}`} {...panelMotion}>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-[1.75rem]">
                    {stepCopy[step].title}
                  </h2>
                  <p className="mt-1.5 text-[15px] text-zinc-500">{stepCopy[step].hint}</p>

                  <div className="mt-6">
                    {step === 1 && (
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {deviceOptions.map((option) => {
                          const isSelected = selectedDevice === option.id
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleDeviceSelect(option.id)}
                              aria-pressed={isSelected}
                              className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1f7a26]/25 ${
                                isSelected
                                  ? "border-[#1f7a26] bg-[#1f7a26]/[0.06]"
                                  : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                              }`}
                            >
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                                <option.icon className={`h-5 w-5 text-zinc-800 ${option.id === "tablet" ? "rotate-90" : ""}`} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[15px] font-semibold text-zinc-900">{option.label}</span>
                                <span className="block text-sm leading-snug text-zinc-500">{option.description}</span>
                              </span>
                              <OptionCheck selected={isSelected} />
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {availableBrands.map((brand) => {
                          const isSelected = selectedBrand === brand.id
                          const BrandIcon = brand.icon
                          const subtitle =
                            brand.models.length === 0
                              ? "Tell us the model"
                              : brand.modelCount
                                ? `${brand.modelCount}+ models`
                                : `${brand.models.length} models`
                          return (
                            <button
                              key={brand.id}
                              type="button"
                              onClick={() => handleBrandSelect(brand.id)}
                              aria-pressed={isSelected}
                              className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1f7a26]/25 ${
                                isSelected
                                  ? "border-[#1f7a26] bg-[#1f7a26]/[0.06]"
                                  : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                              }`}
                            >
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                                {brand.logo ? (
                                  <img src={brand.logo} alt="" className="h-6 w-6 object-contain" loading="lazy" />
                                ) : BrandIcon ? (
                                  <BrandIcon className="h-5 w-5 text-zinc-800" />
                                ) : (
                                  <span className="text-sm font-bold text-zinc-800">{brand.name.charAt(0)}</span>
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[15px] font-semibold text-zinc-900">{brand.name}</span>
                                <span className="block text-sm text-zinc-500">{subtitle}</span>
                              </span>
                              <OptionCheck selected={isSelected} />
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {step === 3 && needsCustomModel && (
                      <div>
                        <FieldLabel htmlFor="custom-model">Brand and model</FieldLabel>
                        <input
                          id="custom-model"
                          value={customModelName}
                          onChange={(event) => setCustomModelName(event.target.value.slice(0, 80))}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault()
                              goToNextStep()
                            }
                          }}
                          placeholder={
                            selectedDevice === "other"
                              ? "e.g. Canon EOS R6, Dell 27\" monitor"
                              : `e.g. ${selectedBrandName.replace(/^Other /, "")} model name`
                          }
                          className={inputClass}
                          autoFocus
                        />
                        {availableModels.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setTypingModel(false)
                              setCustomModelName("")
                            }}
                            className="mt-4 text-sm font-medium text-[#1f7a26] underline-offset-4 hover:underline"
                          >
                            Back to the model list
                          </button>
                        )}
                      </div>
                    )}

                    {step === 3 && !needsCustomModel && (
                      <div>
                        {availableModels.length > MODEL_SEARCH_THRESHOLD && (
                          <div className="relative mb-4">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                              type="search"
                              value={modelQuery}
                              onChange={(event) => setModelQuery(event.target.value)}
                              placeholder={`Search ${availableModels.length} ${selectedBrandName} models`}
                              aria-label="Search models"
                              className={`${inputClass} pl-11`}
                            />
                          </div>
                        )}
                        <div className="grid max-h-[360px] gap-2 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2">
                          {filteredModels.map((model) => {
                            const isSelected = selectedModel === model.id
                            return (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => handleModelSelect(model.id)}
                                aria-pressed={isSelected}
                                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1f7a26]/25 ${
                                  isSelected
                                    ? "border-[#1f7a26] bg-[#1f7a26]/[0.06]"
                                    : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                                }`}
                              >
                                <span className="min-w-0">
                                  <span className="block text-[15px] font-medium text-zinc-900">{model.name}</span>
                                  {model.sub && <span className="block text-sm text-zinc-500">{model.sub}</span>}
                                </span>
                                <OptionCheck selected={isSelected} />
                              </button>
                            )
                          })}
                          {filteredModels.length === 0 && (
                            <p className="rounded-xl bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 sm:col-span-2">
                              No models match &ldquo;{modelQuery}&rdquo;.
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTypingModel(true)
                            setSelectedModel("")
                            setCustomModelName(modelQuery.trim())
                          }}
                          className="mt-4 text-sm font-medium text-[#1f7a26] underline-offset-4 hover:underline"
                        >
                          Can&apos;t find your model? Type it instead
                        </button>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {visibleIssueOptions.map((issue) => {
                          const isSelected = selectedIssues.includes(issue.value)
                          return (
                            <button
                              key={issue.value}
                              type="button"
                              onClick={() => handleIssueToggle(issue.value)}
                              aria-pressed={isSelected}
                              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1f7a26]/25 ${
                                isSelected
                                  ? "border-[#1f7a26] bg-[#1f7a26]/[0.06]"
                                  : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                              }`}
                            >
                              <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                  isSelected ? "bg-[#1f7a26] text-white" : "bg-zinc-100 text-zinc-700"
                                }`}
                              >
                                <issue.icon className="h-[18px] w-[18px]" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[15px] font-semibold text-zinc-900">{issue.label}</span>
                                <span className="block text-sm text-zinc-500">{issue.description}</span>
                              </span>
                              <OptionCheck selected={isSelected} />
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {step === 5 && (
                      <div className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <FieldLabel htmlFor="name">Full name</FieldLabel>
                            <div className="relative">
                              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                              <input
                                id="name"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                placeholder="John Smith"
                                autoComplete="name"
                                aria-invalid={attemptedSubmit && !!nameError}
                                className={`${inputClass} pl-11`}
                              />
                            </div>
                            {attemptedSubmit && nameError && <p className="mt-1.5 text-sm text-red-600">{nameError}</p>}
                          </div>
                          <div>
                            <FieldLabel htmlFor="phone">Mobile number</FieldLabel>
                            <div className="relative">
                              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                              <input
                                id="phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, "").slice(0, 15))}
                                placeholder="0400 000 000"
                                autoComplete="tel"
                                inputMode="numeric"
                                aria-invalid={attemptedSubmit && !!phoneError}
                                className={`${inputClass} pl-11`}
                              />
                            </div>
                            {attemptedSubmit && phoneError && <p className="mt-1.5 text-sm text-red-600">{phoneError}</p>}
                          </div>
                        </div>

                        <div>
                          <FieldLabel htmlFor="email">Email</FieldLabel>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                              id="email"
                              type="email"
                              value={emailAddress}
                              onChange={(event) => setEmailAddress(event.target.value)}
                              placeholder="john@example.com"
                              autoComplete="email"
                              aria-invalid={attemptedSubmit && !!emailError}
                              className={`${inputClass} pl-11`}
                            />
                          </div>
                          {attemptedSubmit && emailError && <p className="mt-1.5 text-sm text-red-600">{emailError}</p>}
                        </div>

                        <div>
                          <FieldLabel htmlFor="message" optional>
                            Anything else we should know?
                          </FieldLabel>
                          <textarea
                            id="message"
                            value={issueDescription}
                            onChange={(event) => setIssueDescription(event.target.value)}
                            placeholder="e.g. Dropped it yesterday, touch still works but the top corner is black."
                            rows={4}
                            className={`${inputClass} h-auto resize-none py-3`}
                          />
                        </div>

                        <div>
                          <FieldLabel htmlFor="condition-images" optional>
                            Photos of the damage
                          </FieldLabel>
                          <div className="flex flex-wrap gap-3">
                            {conditionImagePreviews.map((preview, index) => (
                              <div key={preview} className="relative h-20 w-20 overflow-hidden rounded-xl ring-1 ring-black/10">
                                <img src={preview} alt={`Damage photo ${index + 1}`} className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeImageAt(index)}
                                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                                  aria-label={`Remove photo ${index + 1}`}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                            {conditionImages.length < 4 && (
                              <label
                                htmlFor="condition-images"
                                className="flex h-20 min-w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-300 px-4 text-xs font-medium text-zinc-600 transition-colors hover:border-[#1f7a26] hover:bg-[#1f7a26]/[0.04] hover:text-[#1f7a26]"
                              >
                                <ImagePlus className="h-5 w-5" />
                                {conditionImages.length === 0 ? "Add up to 4 photos" : "Add more"}
                              </label>
                            )}
                          </div>
                          <input
                            id="condition-images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="sticky bottom-3 z-20 mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#f5f3ef]/90 py-2 backdrop-blur-md sm:static sm:bg-transparent sm:py-0 sm:backdrop-blur-none">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={step === 1}
                className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-black/5 disabled:invisible"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {step < 5 ? (
                <button
                  key="next"
                  type="button"
                  onClick={goToNextStep}
                  disabled={!canProceedToNext}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-950 px-7 text-sm font-semibold text-white transition-colors hover:bg-[#1f7a26] disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  key="submit"
                  type="submit"
                  disabled={submitted || isSubmitting}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1f7a26] px-7 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(31,122,38,0.9)] transition-colors hover:bg-[#186420] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : submitted ? (
                    <>
                      <Check className="h-4 w-4" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Get my free quote
                    </>
                  )}
                </button>
              )}
            </div>
            {submitError && (
              <p aria-live="polite" className="mt-3 text-sm font-medium text-red-600">
                {submitError}
              </p>
            )}
          </form>

        </div>
      </div>
    </section>
  )
}
