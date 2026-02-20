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

const quoteStepLabels = ["Device", "Brand", "Model", "Issue", "Your Details"]

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

export function Contact() {
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation()
  const [step, setStep] = useState<QuoteStep>(1)
  const [selectedDevice, setSelectedDevice] = useState<DeviceCategory | "">("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedIssue, setSelectedIssue] = useState("")
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [emailAddress, setEmailAddress] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [conditionImages, setConditionImages] = useState<File[]>([])
  const [conditionImagePreviews, setConditionImagePreviews] = useState<string[]>([])

  const availableBrands = selectedDevice ? getBrandsByCategory(selectedDevice) : []
  const availableModels = selectedBrand ? models.filter((model) => model.brandId === selectedBrand) : []
  const selectedDeviceMeta = selectedDevice ? deviceOptions.find((device) => device.id === selectedDevice) : null
  const selectedBrandName = availableBrands.find((brand) => brand.id === selectedBrand)?.name || ""
  const selectedModelName = availableModels.find((model) => model.id === selectedModel)?.name || ""
  const selectedIssueMeta = issueOptions.find((issue) => issue.value === selectedIssue) || null
  const selectedIssueName = issueOptions.find((issue) => issue.value === selectedIssue)?.label || ""

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
    setSelectedIssue("")
  }

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId)
    setSelectedModel("")
    setSelectedIssue("")
  }

  const canProceedToNext =
    (step === 1 && !!selectedDevice) ||
    (step === 2 && !!selectedBrand) ||
    (step === 3 && !!selectedModel) ||
    (step === 4 && !!selectedIssue)

  const goToNextStep = () => {
    if (!canProceedToNext || step >= 5) return
    setStep((prev) => (prev + 1) as QuoteStep)
  }

  const goToPreviousStep = () => {
    if (step <= 1) return
    setStep((prev) => (prev - 1) as QuoteStep)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !phoneNumber.trim() || !emailAddress.trim()) return
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section
      id="contact"
      className="relative scroll-mt-28 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.06),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.04),transparent_42%),linear-gradient(180deg,#ffffff_0%,#f5f5f5_100%)] py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-black/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-black/5 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <div
          ref={formRef}
          className={`transition-all duration-700 ${
            formVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
            <div className="relative overflow-hidden rounded-[30px] border border-zinc-300 bg-white/95 p-6 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-black/5 blur-2xl" />
              <div className="relative">
                <span className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-700">
                  Get A Quote
                </span>
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                  Tell Us About Your Device
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-zinc-600">
                  Share a few details and our team will send a tailored quote fast.
                  Designed for quick booking, clear communication, and zero back-and-forth.
                </p>

                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {quoteHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f6_100%)] px-3 py-2 text-xs font-semibold text-zinc-700"
                    >
                      <item.icon className="h-3.5 w-3.5 text-zinc-900" />
                      {item.label}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f6_100%)] p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-600">
                        Step {step} of {quoteStepLabels.length}
                      </p>
                      <p className="text-xs font-semibold text-zinc-900">{quoteStepLabels[step - 1]}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
                      <div
                        className="h-full rounded-full bg-zinc-900 transition-all duration-300"
                        style={{ width: `${(step / quoteStepLabels.length) * 100}%` }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2">
                      {quoteStepLabels.map((label, index) => {
                        const stepNumber = (index + 1) as QuoteStep
                        const isCurrent = step === stepNumber
                        const isCompleted = step > stepNumber
                        return (
                          <div key={label} className="text-center">
                            <div
                              className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                                isCurrent
                                  ? "bg-zinc-900 text-white shadow-[0_8px_16px_-10px_rgba(0,0,0,0.6)]"
                                  : isCompleted
                                    ? "bg-zinc-800 text-white"
                                    : "bg-zinc-300 text-zinc-600"
                              }`}
                            >
                              {isCompleted ? "✓" : stepNumber}
                            </div>
                            <p className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
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
                    <div className="rounded-2xl border border-zinc-300 bg-white p-4 sm:p-5">
                      <div className="mb-4 flex items-start justify-between gap-3 border-b border-zinc-200 pb-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-900">
                            <Smartphone className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Step 1</p>
                            <h3 className="mt-1 text-base font-semibold leading-tight text-zinc-900 sm:text-lg">
                              Choose your device type
                            </h3>
                            <p className="mt-1 text-xs text-zinc-600">
                              Pick one to continue with matching brands and models.
                            </p>
                          </div>
                        </div>
                        <p className="hidden rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600 sm:block">
                          3 options
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {deviceOptions.map((option) => {
                          const isSelected = selectedDevice === option.id
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleDeviceSelect(option.id)}
                              className={`group relative min-h-[152px] rounded-xl border px-4 py-4 text-left transition-colors ${
                                isSelected
                                  ? "border-black bg-white text-zinc-900"
                                  : "border-zinc-200 bg-white text-zinc-900 hover:border-black"
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
                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-600">
                                {option.description}
                              </p>
                              <div className="mt-4 h-px w-full bg-zinc-200" />
                              <p className={`mt-3 text-[11px] font-semibold uppercase tracking-[0.11em] ${
                                isSelected ? "text-black" : "text-zinc-500"
                              }`}>{isSelected ? "Selected" : "Select device"}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="rounded-2xl border border-zinc-300 bg-white/95 p-4 shadow-[0_16px_28px_-26px_rgba(0,0,0,0.5)]">
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
                                <p className={`mt-0.5 text-xs ${isSelected ? "text-zinc-200" : "text-zinc-600"}`}>{brand.modelCount}+ models</p>
                              </div>
                              {isSelected && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-white" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="rounded-2xl border border-zinc-300 bg-white/95 p-4 shadow-[0_16px_28px_-26px_rgba(0,0,0,0.5)]">
                      <p className="mb-3 text-sm font-semibold text-zinc-900">Select your model</p>
                      <div className="grid max-h-[290px] gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                        {availableModels.map((model) => {
                          const isSelected = selectedModel === model.id
                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => setSelectedModel(model.id)}
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
                              <p className={`mt-1 text-xs ${isSelected ? "text-zinc-200" : "text-zinc-600"}`}>Release {model.year}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="rounded-2xl border border-zinc-300 bg-white/95 p-4 shadow-[0_16px_28px_-26px_rgba(0,0,0,0.5)]">
                      <p className="mb-3 text-sm font-semibold text-zinc-900">Choose issue type</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {issueOptions.map((issue) => {
                          const isSelected = selectedIssue === issue.value
                          return (
                            <button
                              key={issue.value}
                              type="button"
                              onClick={() => setSelectedIssue(issue.value)}
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
                                <p className={`mt-1 text-xs ${isSelected ? "text-zinc-200" : "text-zinc-600"}`}>{issue.description}</p>
                              </div>
                              {isSelected && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-white" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-zinc-300 bg-[linear-gradient(180deg,#ffffff_0%,#f6f6f6_100%)] p-4 shadow-[0_12px_26px_-24px_rgba(0,0,0,0.55)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-600">Selected Repair</p>
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
                              {selectedIssueMeta ? <selectedIssueMeta.icon className="h-4 w-4" /> : <CircleHelp className="h-4 w-4" />}
                            </div>
                            <span><span className="font-semibold">Issue:</span> {selectedIssueName || "-"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-300 bg-white/95 p-4 shadow-[0_18px_30px_-24px_rgba(0,0,0,0.55)]">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="name"
                              className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600"
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
                              className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600"
                            >
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                              <Input
                                id="phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={(event) => setPhoneNumber(event.target.value)}
                                placeholder="0400 000 000"
                                className="h-12 rounded-xl border-zinc-300 bg-white pl-10 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900/10"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="email"
                            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600"
                          >
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <Input
                              id="email"
                              type="email"
                              value={emailAddress}
                              onChange={(event) => setEmailAddress(event.target.value)}
                              placeholder="john@example.com"
                              className="h-12 rounded-xl border-zinc-300 bg-white pl-10 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900/10"
                              required
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="message"
                            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600"
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
                            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600"
                          >
                            Device Condition Photos (Optional)
                          </label>

                          <label
                            htmlFor="condition-images"
                            className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 transition-colors hover:border-zinc-900 hover:bg-zinc-100"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-zinc-900">Upload clear images of the damage</p>
                              <p className="mt-1 text-xs text-zinc-600">JPG, PNG, WEBP - up to 4 photos</p>
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

                  <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousStep}
                      disabled={step === 1}
                      className="h-11 rounded-xl border-black bg-black px-5 text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-100 disabled:bg-black disabled:text-white"
                    >
                      Back
                    </Button>

                    {step < 5 ? (
                      <Button
                        type="button"
                        onClick={goToNextStep}
                        disabled={!canProceedToNext}
                        className="h-11 rounded-xl bg-black px-6 text-sm font-semibold text-white shadow-[0_16px_35px_-18px_rgba(0,0,0,0.6)] hover:bg-black disabled:cursor-not-allowed disabled:opacity-100 disabled:bg-black disabled:text-white"
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        size="lg"
                        className="h-11 rounded-xl bg-black px-6 text-sm font-semibold text-white shadow-[0_16px_35px_-18px_rgba(0,0,0,0.6)] hover:bg-black disabled:opacity-100 disabled:bg-black disabled:text-white"
                        disabled={submitted}
                      >
                        {submitted ? (
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
                </form>
              </div>
            </div>
        </div>
      </div>
    </section>
  )
}
