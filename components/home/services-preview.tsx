"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { AnimatedSection } from "../animated-section"
import {
  brands,
  models,
  services,
  serviceCategories,
  getBrandsByCategory,
  type DeviceCategory,
} from "../../lib/data"
import {
  MonitorSmartphone,
  BatteryCharging,
  Camera,
  PlugZap,
  Droplets,
  HardDrive,
  Smartphone,
  Settings,
  Tablet,
  Laptop,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Clock,
  DollarSign,
  CheckCircle,
  MapPin,
  Volume2,
  Mic,
  Headphones,
  Power,
  Fingerprint,
  Vibrate,
  ScanFace,
  Monitor,
  Hand,
  Wifi,
  Signal,
  CreditCard,
  ArrowLeftRight,
  ShieldAlert,
  Shield,
  BadgeCheck,
  Unlock,
  Keyboard,
  CircuitBoard,
  FlipVertical,
  Thermometer,
  MemoryStick,
  MousePointer,
} from "lucide-react"

/* ─── Featured icon glyphs (match reference style) ─── */
function Glyph({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

function FeaturedServiceGlyph({ slug, className }: { slug: string; className?: string }) {
  switch (slug) {
    case "screen-repair":
      // Phone with cracked screen
      return (
        <Glyph className={className}>
          <rect x="20" y="9.5" width="24" height="45" rx="6" />
          <rect x="23.5" y="15" width="17" height="31" rx="3.5" opacity="0.6" />
          <path d="M28 13h8" />
          <path d="M29 51h6" />
          {/* crack */}
          <path d="M26 22l8 8-6 6 10 10" />
          <path d="M38 24l-6 10 7 7" />
        </Glyph>
      )
    case "battery-replacement":
      // Phone + battery
      return (
        <Glyph className={className}>
          <rect x="20" y="9.5" width="24" height="45" rx="6" />
          <rect x="23.5" y="15" width="17" height="31" rx="3.5" opacity="0.6" />
          <path d="M28 13h8" />
          <path d="M29 51h6" />
          {/* battery */}
          <rect x="8" y="24" width="10.5" height="16" rx="2.5" />
          <path d="M18.5 28h2" />
          <path d="M13.2 28.7v6.8" />
          <path d="M10.8 32h4.8" />
        </Glyph>
      )
    case "charging-port":
      // Cable / charging port
      return (
        <Glyph className={className}>
          {/* plug */}
          <path d="M18 14v12" />
          <path d="M15.5 14h5" />
          <path d="M16 18h4" />
          {/* cable */}
          <path d="M18 26c0 11 6.5 15 15 15h5.5" />
          {/* port */}
          <rect x="38" y="34" width="11" height="16" rx="3.5" />
          <path d="M41 38h5" />
          <path d="M43.5 40v6" />
          <path d="M42.5 50h2" />
        </Glyph>
      )
    case "water-damage":
      // Phone in water
      return (
        <Glyph className={className}>
          <rect x="20" y="9.5" width="24" height="45" rx="6" />
          <rect x="23.5" y="15" width="17" height="31" rx="3.5" opacity="0.6" />
          <path d="M28 13h8" />
          {/* waves */}
          <path d="M22 39c4-2 8-2 12 0s8 2 12 0" />
          <path d="M22 45c4-2 8-2 12 0s8 2 12 0" />
        </Glyph>
      )
    case "data-recovery":
      // Drive + arrow
      return (
        <Glyph className={className}>
          <rect x="18" y="18" width="28" height="28" rx="6" />
          <path d="M32 24v16" />
          <path d="M27 36l5 5 5-5" />
          <path d="M26 28h12" />
        </Glyph>
      )
    case "motherboard-repair":
      // Logic board traces
      return (
        <Glyph className={className}>
          <path d="M18 22v20" />
          <path d="M46 22v20" />
          <path d="M24 18h16" />
          <path d="M24 46h16" />
          <path d="M26 26h12" />
          <path d="M26 32h12" />
          <path d="M26 38h12" />
          <circle cx="24" cy="26" r="2" />
          <circle cx="40" cy="32" r="2" />
          <circle cx="24" cy="38" r="2" />
          <path d="M24 28v8" />
          <path d="M38 32H28" />
        </Glyph>
      )
    case "camera-repair":
      // Camera module (simple)
      return (
        <Glyph className={className}>
          <rect x="15.5" y="22" width="33" height="22" rx="7" />
          <path d="M24 22l4-6h8l4 6" />
          <circle cx="32" cy="33" r="6.5" />
          <circle cx="32" cy="33" r="2.2" opacity="0.7" />
          <path d="M44 26h4" />
        </Glyph>
      )
    case "back-glass":
      // Phone back crack (simple)
      return (
        <Glyph className={className}>
          <rect x="20" y="9.5" width="24" height="45" rx="6" />
          <path d="M28 13h8" />
          <path d="M29 51h6" />
          {/* back crack */}
          <path d="M26 20l7 9-6 7 11 12" />
        </Glyph>
      )
    case "speaker-repair":
      // Speaker waves
      return (
        <Glyph className={className}>
          <path d="M24 38V26l10-6v24l-10-6z" />
          <path d="M38 29c1.8 1.4 1.8 4.2 0 5.6" />
          <path d="M42 26c3.2 3.2 3.2 8.8 0 12" />
        </Glyph>
      )
    case "microphone-repair":
      // Microphone
      return (
        <Glyph className={className}>
          <rect x="27" y="16" width="10" height="22" rx="5" />
          <path d="M22 30c0 6 4.5 11 10 11s10-5 10-11" />
          <path d="M32 41v7" />
          <path d="M26 48h12" />
        </Glyph>
      )
    default:
      return null
  }
}

/* ─── Service icon map ─── */
const serviceIconMap: Record<string, React.ElementType> = {
  "monitor-smartphone": MonitorSmartphone,
  "battery-charging": BatteryCharging,
  camera: Camera,
  "plug-zap": PlugZap,
  droplets: Droplets,
  "hard-drive": HardDrive,
  smartphone: Smartphone,
  settings: Settings,
  "volume-2": Volume2,
  mic: Mic,
  headphones: Headphones,
  power: Power,
  fingerprint: Fingerprint,
  vibrate: Vibrate,
  "scan-face": ScanFace,
  monitor: Monitor,
  hand: Hand,
  wifi: Wifi,
  signal: Signal,
  "credit-card": CreditCard,
  "arrow-left-right": ArrowLeftRight,
  "shield-alert": ShieldAlert,
  shield: Shield,
  unlock: Unlock,
  keyboard: Keyboard,
  "circuit-board": CircuitBoard,
  "flip-vertical": FlipVertical,
  thermometer: Thermometer,
  "memory-stick": MemoryStick,
  "mouse-pointer": MousePointer,
}

/* ─── Brand Logos ─── */
function AppleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 384 512" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

const brandLogos: Record<string, React.FC<{ className?: string }>> = {
  apple: AppleLogo,
  ipad: AppleLogo,
  macbook: AppleLogo,
}

/* ─── Device categories ─── */
const deviceCategoryConfig = [
  { id: "mobile" as DeviceCategory, label: "Mobile", icon: Smartphone, desc: "iPhone, Samsung, Google & more" },
  { id: "tablet" as DeviceCategory, label: "Tablet / iPad", icon: Tablet, desc: "iPad, Samsung Tab & more" },
  { id: "laptop" as DeviceCategory, label: "Laptop", icon: Laptop, desc: "MacBook, Dell, HP & more" },
]

/* ─── Custom dropdown with search + "not listed" custom entry ─── */
function SelectDropdown({
  label, value, onChange, options, placeholder, allowCustom = false, customLabel = "My model is not listed",
}: {
  label: string
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string; sub?: string }[]
  placeholder: string
  allowCustom?: boolean
  customLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [customMode, setCustomMode] = useState(false)
  const [customValue, setCustomValue] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch("") }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus()
  }, [open])

  const selected = options.find((o) => o.value === value)
  const isCustomSelected = value.startsWith("custom:")
  const displayLabel = selected?.label || (isCustomSelected ? value.replace("custom:", "") : "")

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>

      {/* Custom entry mode */}
      {customMode ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Type your model name..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3.5 text-[15px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              if (customValue.trim()) {
                onChange("custom:" + customValue.trim())
              }
              setCustomMode(false)
            }}
            className="rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => { setCustomMode(false); setCustomValue("") }}
            className="rounded-xl border border-border px-4 py-3.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-secondary"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => { setOpen(!open); setSearch("") }}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-[15px] transition-all ${
              open ? "border-primary bg-background ring-2 ring-primary/20" : "border-border bg-background hover:border-primary/30"
            }`}
          >
            <span className={displayLabel ? "font-medium text-foreground" : "text-muted-foreground"}>
              {displayLabel || placeholder}
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-border bg-card shadow-xl">
              {/* Search input */}
              {options.length > 5 && (
                <div className="border-b border-border p-2">
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-lg bg-secondary/50 px-3 py-3 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
              )}
              {/* Options */}
              <div className="max-h-52 overflow-y-auto">
                {filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); setSearch("") }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-[15px] transition-colors active:bg-primary/5 ${
                      value === opt.value ? "bg-primary/10 font-semibold text-primary" : "text-foreground"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.sub && <span className="text-xs text-muted-foreground">{opt.sub}</span>}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="px-4 py-3 text-sm text-muted-foreground">No results found</p>
                )}
              </div>
              {/* Custom entry option */}
              {allowCustom && (
                <button
                  type="button"
                  onClick={() => { setOpen(false); setSearch(""); setCustomMode(true); setCustomValue(search) }}
                  className="flex w-full items-center gap-2 border-t border-border px-4 py-3.5 text-left text-[15px] font-medium text-primary transition-colors active:bg-primary/5"
                >
                  <span>+ {customLabel}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════
   Main Component
═══════════════════ */
type Step = 1 | 2 | 3 | 4

export function ServicesPreview() {
  const [step, setStep] = useState<Step>(1)
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<DeviceCategory | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("")
  const sectionRef = useRef<HTMLElement>(null)

  const scrollToSection = () => {
    if (sectionRef.current) {
      const top = sectionRef.current.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  // Step handlers
  const handleServiceSelect = (slug: string) => {
    setSelectedServiceSlug(slug)
    setTimeout(scrollToSection, 30)
  }

  const handleDeviceSelect = (cat: DeviceCategory) => {
    setSelectedDevice(cat)
    setSelectedBrand(null)
    setSelectedModel("")
    setSelectedServiceSlug(null)
    setStep(2)
    setTimeout(scrollToSection, 50)
  }

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId)
    setSelectedModel("")
    setSelectedServiceSlug(null)
    setStep(3)
    setTimeout(scrollToSection, 50)
  }

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
    setSelectedServiceSlug(null)
    setStep(4)
    setTimeout(scrollToSection, 50)
  }

  const goBack = () => {
    if (step === 4) { setSelectedServiceSlug(null); setStep(3) }
    else if (step === 3) { setSelectedModel(""); setSelectedServiceSlug(null); setStep(2) }
    else if (step === 2) { setSelectedBrand(null); setSelectedModel(""); setSelectedServiceSlug(null); setStep(1) }
  }

  // Derived data
  const currentServiceCat = serviceCategories.find((c) => c.slug === selectedServiceSlug)
  const currentBrands = selectedDevice ? getBrandsByCategory(selectedDevice) : []
  const currentBrand = brands.find((b) => b.id === selectedBrand)
  const currentModels = selectedBrand ? models.filter((m) => m.brandId === selectedBrand) : []
  const isCustomModel = selectedModel.startsWith("custom:")
  const customModelName = isCustomModel ? selectedModel.replace("custom:", "") : ""
  const currentModel = isCustomModel ? null : models.find((m) => m.id === selectedModel)
  const modelDisplayName = isCustomModel ? customModelName : currentModel?.name || ""
  const modelOptions = currentModels.map((m) => ({ value: m.id, label: m.name, sub: m.year }))

  const matchedRepair =
    selectedModel && currentServiceCat
      ? services.find(
          (s) =>
            s.modelId === selectedModel &&
            s.name.toLowerCase().includes(currentServiceCat.name.split(" ")[0].toLowerCase())
        )
      : null

  // Breadcrumb
  const crumbs = [
    selectedDevice && deviceCategoryConfig.find((d) => d.id === selectedDevice)?.label,
    currentBrand?.name,
    modelDisplayName || undefined,
    currentServiceCat?.name,
  ].filter(Boolean)

  const stepLabels = ["Device", "Brand", "Model", "Services"]

  return (
    <section className="bg-background py-12 sm:py-14 lg:py-16" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* ─── Header ─── */}
        <AnimatedSection>
          <div className="text-center">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-primary sm:text-sm">Our Services</p>
            <h2 className="mt-2 text-balance text-2xl font-bold tracking-tight text-foreground sm:mt-3 sm:text-3xl lg:text-4xl">
              Everything your device needs
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
              From screen repairs to data recovery, our certified technicians handle it all with precision and care.
            </p>
          </div>
        </AnimatedSection>

        {/* ─── Progress ─── */}
        <div className="mt-4 flex items-center justify-center gap-1.5 sm:mt-6 sm:gap-2">
          {stepLabels.map((label, i) => {
            const s = (i + 1) as Step
            const isActive = step >= s
            const isCurrent = step === s
            return (
              <React.Fragment key={label}>
                {i > 0 && (
                  <div
                    className="h-0.5 w-6 sm:w-10 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: step > i ? "var(--primary)" : "var(--border)" }}
                  />
                )}
                <button
                  onClick={() => {
                    if (s < step) {
                      if (s === 1) { setSelectedDevice(null); setSelectedBrand(null); setSelectedModel(""); setSelectedServiceSlug(null) }
                      else if (s === 2) { setSelectedBrand(null); setSelectedModel(""); setSelectedServiceSlug(null) }
                      else if (s === 3) { setSelectedServiceSlug(null) }
                      setStep(s)
                    }
                  }}
                  disabled={s > step}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition-all duration-300 sm:px-2.5 sm:py-1.5 sm:text-xs ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold sm:h-5 sm:w-5 sm:text-[10px] ${
                    isCurrent
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-muted-foreground/20 text-muted-foreground"
                  }`}>
                    {step > s ? "✓" : s}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              </React.Fragment>
            )
          })}
        </div>

        {/* ─── Back + breadcrumb ─── */}
        {step > 1 && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors active:bg-secondary hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span className="text-sm text-muted-foreground truncate">{crumbs.join(" → ")}</span>
          </div>
        )}

        {/* ═══════════════════════════════
            STEP 1 — Select Device Type
        ═══════════════════════════════ */}
        {step === 1 && (
          <div className="mt-7 sm:mt-8">
            <p className="mb-6 text-center text-base font-semibold text-foreground sm:mb-7 sm:text-lg">
              What type of device do you have?
            </p>
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
              {deviceCategoryConfig.map((dc) => {
                const Icon = dc.icon
                return (
                  <button
                    key={dc.id}
                    onClick={() => handleDeviceSelect(dc.id)}
                    className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-card p-8 transition-all duration-200 hover:border-primary hover:shadow-lg"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <span className="block text-lg font-bold text-card-foreground">{dc.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{dc.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════
            STEP 2 — Select Brand
        ═══════════════════════════════ */}
        {step === 2 && (
          <div className="mt-7 sm:mt-8">
            <p className="mb-8 text-center text-lg font-semibold text-foreground">
              Select your brand
            </p>
            <div
              className="mx-auto grid max-w-4xl gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(currentBrands.length, 5)}, minmax(0, 1fr))`,
              }}
            >
              {currentBrands.map((brand) => {
                const LogoComponent = brandLogos[brand.id]
                return (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand.id)}
                    className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-6 transition-all duration-200 hover:border-primary hover:shadow-lg"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      {LogoComponent ? (
                        <LogoComponent className="h-7 w-7 text-primary" />
                      ) : (
                        <span className="text-lg font-extrabold text-primary">{brand.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-card-foreground">{brand.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            STEP 3 — Model Selection
        ═══════════════════════════════════════ */}
        {step === 3 && (
          <div className="mt-7 sm:mt-8">
            <div className="mx-auto max-w-xl">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-border pb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    {brandLogos[selectedBrand || ""] ? (
                      React.createElement(brandLogos[selectedBrand || ""], { className: "h-6 w-6 text-primary" })
                    ) : (
                      <span className="text-lg font-extrabold text-primary">{currentBrand?.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {currentBrand?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">Select your model to continue</p>
                  </div>
                </div>

                {/* Model dropdown */}
                <div className="mt-6">
                  <SelectDropdown
                    label="Model"
                    value={selectedModel}
                    onChange={handleModelSelect}
                    options={modelOptions}
                    placeholder="Choose your model..."
                    allowCustom
                    customLabel="My model is not listed — enter manually"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════
            STEP 4 — Select Service + Book
        ═══════════════════════════════ */}
        {step === 4 && (
          <div className="mt-6 sm:mt-7">
            <p className="mb-6 text-center text-base font-semibold text-foreground sm:mb-7 sm:text-lg">
              Choose the service you need
            </p>
            <div className="mx-auto grid max-w-5xl grid-cols-3 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-7">
              {serviceCategories.slice(0, 8).map((cat, i) => {
                const Icon = serviceIconMap[cat.icon] || Settings
                const isSelected = selectedServiceSlug === cat.slug
                return (
                  <AnimatedSection key={cat.id} delay={i * 60}>
                    <button
                      onClick={() => handleServiceSelect(cat.slug)}
                      type="button"
                      title={cat.name}
                      aria-label={cat.name}
                      className="group flex w-full max-w-[140px] flex-col items-center text-center transition-transform duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <div className={`flex h-[104px] w-[104px] items-center justify-center rounded-2xl border-2 transition-colors duration-150 sm:h-[116px] sm:w-[116px] ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-foreground/55 bg-background group-hover:border-foreground/80 group-hover:bg-secondary/30"
                      }`}>
                        {FeaturedServiceGlyph({ slug: cat.slug, className: "h-14 w-14 text-foreground sm:h-16 sm:w-16" }) ?? (
                          <Icon className="h-14 w-14 text-foreground sm:h-16 sm:w-16" />
                        )}
                      </div>
                      <span className="mt-2.5 text-balance text-[12px] font-medium leading-snug text-foreground/80 line-clamp-2 sm:text-[13px]">
                        {cat.name}
                      </span>
                    </button>
                  </AnimatedSection>
                )
              })}
            </div>

            <AnimatedSection className="mt-6 text-center sm:mt-7">
              <Link
                href="/services"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-transparent px-6 text-sm font-medium text-foreground transition-all hover:bg-secondary"
              >
                View All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </AnimatedSection>

            {selectedServiceSlug && (
              <div className="mx-auto mt-7 max-w-xl sm:mt-8">
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                  <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Service</span>
                      <span className="text-sm font-semibold text-foreground">{currentServiceCat?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Device</span>
                      <span className="text-sm font-semibold text-foreground">{currentBrand?.name} {modelDisplayName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Time Estimated
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {matchedRepair?.estimateTime || "Contact us"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" /> Cost Estimated
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {matchedRepair ? `From $${matchedRepair.estimateCost}` : "Get a quote"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                    <Link
                      href={(() => {
                        const params = new URLSearchParams()
                        if (selectedBrand) params.set("brand", selectedBrand)
                        if (selectedModel) params.set("model", selectedModel)
                        if (selectedDevice) params.set("device", selectedDevice)
                        if (matchedRepair) params.set("serviceId", matchedRepair.id)
                        if (selectedServiceSlug) params.set("serviceSlug", selectedServiceSlug)
                        if (modelDisplayName) params.set("modelName", modelDisplayName)
                        if (currentBrand?.name) params.set("brandName", currentBrand.name)
                        if (currentServiceCat?.name) params.set("serviceName", currentServiceCat.name)
                        if (matchedRepair) {
                          params.set("cost", String(matchedRepair.estimateCost))
                          params.set("time", matchedRepair.estimateTime)
                        }
                        return `/book?${params.toString()}`
                      })()}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-primary p-3.5 text-primary-foreground transition-all active:brightness-95 hover:shadow-md hover:brightness-110 sm:p-3"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-[13px] font-semibold sm:text-xs">Book Online</span>
                    </Link>
                    <Link
                      href="/locations"
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3.5 text-foreground transition-all active:bg-secondary hover:bg-secondary sm:p-3"
                    >
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="text-[13px] font-semibold sm:text-xs">Visit Us</span>
                    </Link>
                    <a
                      href="tel:0297451234"
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3.5 text-foreground transition-all active:bg-secondary hover:bg-secondary sm:p-3"
                    >
                      <Smartphone className="h-5 w-5 text-primary" />
                      <span className="text-[13px] font-semibold sm:text-xs">Call Us</span>
                    </a>
                    <Link
                      href="/quote"
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3.5 text-foreground transition-all active:bg-secondary hover:bg-secondary sm:p-3"
                    >
                      <ArrowRight className="h-5 w-5 text-primary" />
                      <span className="text-[13px] font-semibold sm:text-xs">Get Quote</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
