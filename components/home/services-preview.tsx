"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

/* ─── Device categories ─── */
const deviceCategoryConfig = [
  {
    id: "mobile" as DeviceCategory,
    label: "Mobile",
    icon: Smartphone,
    desc: "iPhone, Samsung, Google & more",
  },
  {
    id: "tablet" as DeviceCategory,
    label: "Tablet / iPad",
    icon: Tablet,
    desc: "iPad, Samsung Tab & more",
  },
  {
    id: "laptop" as DeviceCategory,
    label: "Laptop",
    icon: Laptop,
    desc: "MacBook, Dell, HP & more",
  },
]

function DeviceLineDrawing({ type, className }: { type: DeviceCategory; className?: string }) {
  if (type === "mobile") {
    return (
      <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
        <rect x="32" y="10" width="56" height="100" rx="14" stroke="currentColor" strokeWidth="3" />
        <rect x="38" y="22" width="44" height="72" rx="6" stroke="currentColor" strokeWidth="2.2" opacity="0.9" />
        <rect x="52" y="15" width="16" height="2.8" rx="1.4" fill="currentColor" />
        <circle cx="60" cy="102" r="4.5" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    )
  }

  if (type === "tablet") {
    return (
      <svg viewBox="0 0 160 120" fill="none" className={className} aria-hidden="true">
        <rect x="10" y="16" width="140" height="88" rx="14" stroke="currentColor" strokeWidth="3" />
        <rect x="20" y="24" width="120" height="72" rx="8" stroke="currentColor" strokeWidth="2.2" opacity="0.9" />
        <circle cx="145" cy="60" r="2.5" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 170 120" fill="none" className={className} aria-hidden="true">
      <rect x="32" y="14" width="106" height="64" rx="6" stroke="currentColor" strokeWidth="3" />
      <rect x="39" y="21" width="92" height="48" rx="4" stroke="currentColor" strokeWidth="2.2" opacity="0.9" />
      <path d="M14 90h142l-14 14H28L14 90Z" stroke="currentColor" strokeWidth="3" />
      <rect x="73" y="93" width="24" height="3" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function OtherDeviceDrawing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 120" fill="none" className={className} aria-hidden="true">
      <path d="M20 96h130" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <rect x="24" y="16" width="122" height="74" rx="6" stroke="currentColor" strokeWidth="3" />
      <rect x="31" y="24" width="108" height="58" rx="4" stroke="currentColor" strokeWidth="2.3" />
      <path d="M31 78c10 2 21 1 33 2 13 1 26-1 40 0 13 1 24-1 35 0" stroke="currentColor" strokeWidth="2" opacity="0.55" />
      <path d="M76 90h20l3 14H73l3-14Z" stroke="currentColor" strokeWidth="3" />
      <path d="M58 108h56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M83 42c2-4 6-6 10-6 5 0 9 3 9 8 0 5-3 7-6 9-3 2-5 4-5 8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="91" cy="72" r="2" fill="currentColor" />
    </svg>
  )
}

/* ─── Model picker with searchable cards + custom entry ─── */
function ModelCardPicker({
  value,
  onChange,
  options,
  customLabel = "My model is not listed",
  emptyStateMessage = "No models match your search",
}: {
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string; sub?: string }[]
  customLabel?: string
  emptyStateMessage?: string
}) {
  const [search, setSearch] = useState("")
  const [customValue, setCustomValue] = useState("")

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const selectedCustomModel = value.startsWith("custom:") ? value.replace("custom:", "") : ""

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Model</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your model..."
          className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {filtered.map((opt) => {
          const isSelected = value === opt.value

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-background hover:border-primary/40 hover:bg-secondary/50"
              }`}
            >
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {opt.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {opt.sub ? `Release year ${opt.sub}` : "Model option"}
                </p>
              </div>
              {isSelected ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {opt.sub || "Select"}
                </span>
              )}
            </button>
          )
        })}

        {filtered.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center text-sm text-muted-foreground">
            {emptyStateMessage}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">{customLabel}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter your exact model name if it is not listed above.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Type your model name..."
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => {
              const customModel = customValue.trim()
              if (customModel) onChange("custom:" + customModel)
            }}
            aria-disabled={!customValue.trim()}
            className="rounded-xl border border-[#000000] bg-[#000000] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-[#000000] hover:shadow-[0_12px_24px_rgba(0,0,0,0.32)] hover:ring-2 hover:ring-white/70 hover:ring-offset-1 hover:ring-offset-zinc-200 active:translate-y-0 active:bg-[#000000]"
          >
            Use this model
          </button>
        </div>
        {selectedCustomModel && (
          <p className="mt-2 text-xs font-medium text-primary">
            Selected custom model: {selectedCustomModel}
          </p>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════
   Main Component
═══════════════════ */
type Step = 1 | 2 | 3 | 4
type ServicesJumpDetail = {
  device?: DeviceCategory
  step?: Step
}
const OTHER_DEVICE_BRAND_ID = "other-device-custom"
const OTHER_DEVICE_OPTIONS = [
  { value: "custom:Smart Watch", label: "Smart Watch", sub: "Other device" },
  { value: "custom:Digital Cameras", label: "Digital Cameras", sub: "Other device" },
  { value: "custom:Computer Monitor", label: "Monitor", sub: "Other device" },
  { value: "custom:Desktop Computer", label: "Desktop Computer", sub: "Other device" },
  { value: "custom:Gaming Console", label: "Gaming Console", sub: "Other device" },
  { value: "custom:Audio Device", label: "Audio Device", sub: "Other device" },
]
const LAPTOP_ONLY_SERVICE_SLUGS = new Set([
  "keyboard-repair",
  "motherboard-repair",
  "hinge-repair",
  "fan-overheating",
  "storage-upgrade",
  "trackpad-repair",
])
const HANDHELD_ONLY_SERVICE_SLUGS = new Set([
  "back-glass",
  "sim-card-tray",
  "home-button",
  "vibration-motor",
  "face-id-repair",
  "device-unlocking",
])

export function ServicesPreview() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<DeviceCategory | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("")
  const [showMoreModels, setShowMoreModels] = useState(false)
  const [showMoreServices, setShowMoreServices] = useState(false)
  const [customServiceIssue, setCustomServiceIssue] = useState("")
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
    const selectedCategory = serviceCategories.find((c) => c.slug === slug)
    const isOtherDeviceBrand = selectedBrand === OTHER_DEVICE_BRAND_ID
    const selectedBrandObj = isOtherDeviceBrand ? null : brands.find((b) => b.id === selectedBrand)
    const isCustomModel = selectedModel.startsWith("custom:")
    const customModelName = isCustomModel ? selectedModel.replace("custom:", "") : ""
    const selectedModelObj = isCustomModel ? null : models.find((m) => m.id === selectedModel)
    const modelDisplayName = isCustomModel ? customModelName : selectedModelObj?.name || ""
    const brandDisplayName = isOtherDeviceBrand ? "Other Device" : selectedBrandObj?.name || ""
    const matchedRepair =
      selectedModel && selectedCategory
        ? services.find(
            (s) =>
              s.modelId === selectedModel &&
              s.name.toLowerCase().includes(selectedCategory.name.split(" ")[0].toLowerCase())
          )
        : null

    const params = new URLSearchParams()
    if (selectedBrand) params.set("brand", selectedBrand)
    if (selectedModel) params.set("model", selectedModel)
    if (selectedDevice) params.set("device", selectedDevice)
    if (matchedRepair) params.set("serviceId", matchedRepair.id)
    params.set("serviceSlug", slug)
    if (modelDisplayName) params.set("modelName", modelDisplayName)
    if (brandDisplayName) params.set("brandName", brandDisplayName)
    if (selectedCategory?.name) params.set("serviceName", selectedCategory.name)
    if (matchedRepair) {
      params.set("cost", String(matchedRepair.estimateCost))
      params.set("time", matchedRepair.estimateTime)
    }

    router.push(`/book?${params.toString()}`)
  }

  const handleCustomServiceSubmit = () => {
    const issue = customServiceIssue.trim()
    if (!issue) return

    const params = new URLSearchParams()
    if (selectedBrand) params.set("brand", selectedBrand)
    if (selectedModel) params.set("model", selectedModel)
    if (selectedDevice) params.set("device", selectedDevice)
    if (modelDisplayName) params.set("modelName", modelDisplayName)
    if (brandDisplayName) params.set("brandName", brandDisplayName)
    params.set("serviceSlug", "custom-problem")
    params.set("serviceName", "Custom Problem")
    params.set("customIssue", issue)

    router.push(`/book?${params.toString()}`)
  }

  const handleDeviceSelect = (cat: DeviceCategory) => {
    setSelectedDevice(cat)
    setSelectedBrand(null)
    setSelectedModel("")
    setSelectedServiceSlug(null)
    setCustomServiceIssue("")
    setStep(2)
    setTimeout(scrollToSection, 50)
  }

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId)
    setSelectedModel("")
    setSelectedServiceSlug(null)
    setCustomServiceIssue("")
    setStep(3)
    setTimeout(scrollToSection, 50)
  }

  const handleOtherDeviceSelect = () => {
    setSelectedDevice(null)
    setSelectedBrand(OTHER_DEVICE_BRAND_ID)
    setSelectedModel("")
    setSelectedServiceSlug(null)
    setCustomServiceIssue("")
    setStep(3)
    setTimeout(scrollToSection, 50)
  }

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
    setSelectedServiceSlug(null)
    setCustomServiceIssue("")
    setStep(4)
    setTimeout(scrollToSection, 50)
  }

  const goBack = () => {
    if (step === 4) { setSelectedServiceSlug(null); setCustomServiceIssue(""); setStep(3) }
    else if (step === 3) {
      setSelectedModel("")
      setSelectedServiceSlug(null)
      setCustomServiceIssue("")
      if (selectedBrand === OTHER_DEVICE_BRAND_ID) {
        setSelectedBrand(null)
        setStep(1)
      } else {
        setStep(2)
      }
    }
    else if (step === 2) { setSelectedBrand(null); setSelectedModel(""); setSelectedServiceSlug(null); setCustomServiceIssue(""); setStep(1) }
  }

  // Derived data
  const currentServiceCat = serviceCategories.find((c) => c.slug === selectedServiceSlug)
  const currentBrands = selectedDevice ? getBrandsByCategory(selectedDevice) : []
  const currentBrand = brands.find((b) => b.id === selectedBrand)
  const isOtherDeviceBrand = selectedBrand === OTHER_DEVICE_BRAND_ID
  const brandDisplayName = isOtherDeviceBrand ? "Other Device" : currentBrand?.name || ""
  const currentModels = selectedBrand ? models.filter((m) => m.brandId === selectedBrand) : []
  const isCustomModel = selectedModel.startsWith("custom:")
  const customModelName = isCustomModel ? selectedModel.replace("custom:", "") : ""
  const currentModel = isCustomModel ? null : models.find((m) => m.id === selectedModel)
  const modelDisplayName = isCustomModel ? customModelName : currentModel?.name || ""
  const modelOptions = isOtherDeviceBrand
    ? OTHER_DEVICE_OPTIONS
    : currentModels.map((m) => ({ value: m.id, label: m.name, sub: m.year }))
  const selectedDeviceLabel = selectedDevice
    ? deviceCategoryConfig.find((d) => d.id === selectedDevice)?.label || "Device"
    : isOtherDeviceBrand
      ? "Other Device"
      : "Device"
  const filteredServiceCategories = serviceCategories.filter((cat) => {
    if (selectedDevice === "laptop") return !HANDHELD_ONLY_SERVICE_SLUGS.has(cat.slug)
    if (selectedDevice === "mobile" || selectedDevice === "tablet") return !LAPTOP_ONLY_SERVICE_SLUGS.has(cat.slug)
    return true
  })
  const visibleServiceCategories = showMoreServices
    ? filteredServiceCategories
    : filteredServiceCategories.slice(0, 8)

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
    brandDisplayName || undefined,
    modelDisplayName || undefined,
    currentServiceCat?.name,
  ].filter(Boolean)

  const stepLabels = ["Device", "Brand", "Model", "Services"]

  useEffect(() => {
    setShowMoreModels(false)
  }, [selectedBrand])

  useEffect(() => {
    setShowMoreServices(false)
  }, [selectedDevice, selectedBrand, selectedModel])

  useEffect(() => {
    const onServicesJump = (event: Event) => {
      const customEvent = event as CustomEvent<ServicesJumpDetail>
      const nextDevice = customEvent.detail?.device
      const nextStep = customEvent.detail?.step
      if (!nextDevice) return

      setSelectedDevice(nextDevice)
      setSelectedBrand(null)
      setSelectedModel("")
      setSelectedServiceSlug(null)
      setCustomServiceIssue("")
      setStep(nextStep && nextStep >= 1 && nextStep <= 4 ? nextStep : 2)
      setTimeout(scrollToSection, 50)
    }

    window.addEventListener("services:go-to-step", onServicesJump as EventListener)
    return () => window.removeEventListener("services:go-to-step", onServicesJump as EventListener)
  }, [])

  return (
    <section id="our-services" className="bg-zinc-200 py-12 sm:py-14 lg:py-16" ref={sectionRef}>
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
                    className={`h-0.5 w-6 rounded-full transition-colors duration-300 sm:w-10 ${
                      step > i ? "bg-zinc-900" : "bg-border"
                    }`}
                  />
                )}
                <button
                  onClick={() => {
                    if (s < step) {
                      if (s === 1) { setSelectedDevice(null); setSelectedBrand(null); setSelectedModel(""); setSelectedServiceSlug(null); setCustomServiceIssue("") }
                      else if (s === 2) {
                        if (isOtherDeviceBrand) {
                          setSelectedDevice(null)
                          setSelectedBrand(null)
                          setSelectedModel("")
                          setSelectedServiceSlug(null)
                          setCustomServiceIssue("")
                          setStep(1)
                          return
                        }
                        setSelectedBrand(null); setSelectedModel(""); setSelectedServiceSlug(null); setCustomServiceIssue("")
                      }
                      else if (s === 3) { setSelectedServiceSlug(null); setCustomServiceIssue("") }
                      setStep(s)
                    }
                  }}
                  disabled={s > step}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition-all duration-300 sm:px-2.5 sm:py-1.5 sm:text-xs ${
                    isCurrent
                      ? "bg-zinc-900 text-white"
                      : isActive
                        ? "cursor-pointer bg-zinc-900/10 text-zinc-900 hover:bg-zinc-900/20"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold sm:h-5 sm:w-5 sm:text-[10px] ${
                    isCurrent
                      ? "bg-white/20 text-white"
                      : isActive
                        ? "bg-zinc-900/20 text-zinc-900"
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

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {deviceCategoryConfig.map((dc) => {
                return (
                  <button
                    key={dc.id}
                    onClick={() => handleDeviceSelect(dc.id)}
                    className="group px-3 pb-4 pt-3 text-center transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="flex h-52 items-center justify-center rounded-2xl border border-zinc-300 bg-zinc-200 transition-colors duration-200 group-hover:border-zinc-500 group-hover:bg-zinc-200 sm:h-60">
                      <DeviceLineDrawing
                        type={dc.id}
                        className="h-44 w-44 text-zinc-900 transition-transform duration-200 group-hover:scale-105 sm:h-52 sm:w-52"
                      />
                    </div>
                    <div className="mt-2">
                      <span className="block text-xl font-semibold tracking-tight text-foreground">{dc.label}</span>
                      <span className="mt-1 block text-sm leading-snug text-muted-foreground">{dc.desc}</span>
                    </div>
                  </button>
                )
              })}

              <button
                type="button"
                onClick={handleOtherDeviceSelect}
                className="group px-3 pb-4 pt-3 text-center transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="flex h-52 items-center justify-center rounded-2xl border border-zinc-300 bg-zinc-200 transition-colors duration-200 group-hover:border-zinc-500 group-hover:bg-zinc-200 sm:h-60">
                  <OtherDeviceDrawing className="h-44 w-44 text-zinc-900 transition-transform duration-200 group-hover:scale-105 sm:h-52 sm:w-52" />
                </div>
                <div className="mt-2">
                  <span className="block text-xl font-semibold tracking-tight text-foreground">Other</span>
                  <span className="mt-1 block text-sm leading-snug text-muted-foreground">Smart Watch, Digital Cameras, Monitor, Desktop Computer & more</span>
                </div>
              </button>
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
                const logoSrc = brandLogoCdn[brand.id]
                return (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand.id)}
                    className="group flex flex-col items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="flex h-[7.5rem] w-[7.5rem] items-center justify-center rounded-2xl border border-zinc-300 bg-zinc-200 transition-colors duration-200 group-hover:border-zinc-500 group-hover:bg-zinc-200">
                      {logoSrc ? (
                        <img src={logoSrc} alt={`${brand.name} logo`} className="h-[5.5rem] w-[5.5rem] object-contain transition-transform duration-200 group-hover:scale-110" loading="lazy" />
                      ) : LogoComponent ? (
                        <LogoComponent className="h-[4.75rem] w-[4.75rem] text-black transition-transform duration-200 group-hover:scale-110" />
                      ) : (
                        <span className="text-lg font-extrabold text-black">{brand.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground/80 transition-colors group-hover:text-foreground">{brand.name}</span>
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
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-zinc-300 bg-zinc-200 p-5 sm:p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[120px_1fr] sm:items-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-zinc-300 bg-white shadow-[0_8px_22px_rgba(0,0,0,0.10)] sm:mx-0 sm:h-28 sm:w-28">
                  {selectedBrand && brandLogoCdn[selectedBrand] ? (
                    <img
                      src={brandLogoCdn[selectedBrand]}
                      alt={`${brandDisplayName} logo`}
                      className="h-16 w-16 object-contain"
                      loading="lazy"
                    />
                  ) : brandLogos[selectedBrand || ""] ? (
                    React.createElement(brandLogos[selectedBrand || ""], { className: "h-14 w-14 text-zinc-900" })
                  ) : (
                    <span className="text-3xl font-extrabold text-zinc-900">{(brandDisplayName || "Other").charAt(0)}</span>
                  )}
                </div>
                <h3 className="text-center text-2xl font-semibold leading-tight text-zinc-900 sm:text-left sm:text-4xl">
                  <span className="text-zinc-500">Choose your</span>
                  <br />
                  <span className="text-zinc-900">{brandDisplayName || "Device"} </span>
                  <span className="text-zinc-500">model</span>
                </h3>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(showMoreModels ? modelOptions : modelOptions.slice(0, 9)).map((opt) => {
                  const isSelected = selectedModel === opt.value
                  const modelName = opt.label.replace(brandDisplayName, "").trim() || opt.label
                  const words = modelName.split(/\s+/).filter(Boolean)
                  const topLabel = words.length > 1 ? words[0] : (brandDisplayName || "Device")
                  const remainingWords = words.length > 1 ? words.slice(1) : words
                  const trailingKeywords = ["Max", "Plus", "Mini", "Ultra"]
                  const hasBottom = remainingWords.length > 1 && trailingKeywords.includes(remainingWords[remainingWords.length - 1])
                  const mainLabel = hasBottom ? remainingWords.slice(0, -1).join(" ") : remainingWords.join(" ")
                  const bottomLabel = hasBottom ? remainingWords[remainingWords.length - 1] : ""
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleModelSelect(opt.value)}
                      className={`rounded-[1.45rem] border-2 bg-transparent px-2 py-2 text-center transition-all duration-200 ${
                        isSelected
                          ? "border-zinc-500 text-zinc-900 shadow-[0_4px_16px_rgba(2,6,23,0.08)]"
                          : "border-zinc-300 text-zinc-900 hover:border-black"
                      }`}
                    >
                      <div className="flex h-24 flex-col items-center justify-center sm:h-28">
                        <p className={`text-[11px] sm:text-xs ${isSelected ? "text-zinc-600" : "text-zinc-500"}`}>
                          {topLabel}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[1.15rem] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-[1.3rem]">
                          {mainLabel || modelName}
                        </p>
                        <p className={`mt-1 text-[1rem] leading-none sm:text-[1.15rem] ${
                          isSelected ? "text-zinc-600" : "text-zinc-500"
                        }`}>
                          {bottomLabel || "\u00A0"}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {modelOptions.length > 9 && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowMoreModels((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-zinc-900 transition-colors hover:bg-zinc-50"
                  >
                    {showMoreModels ? "Show Less Models" : "View More Models"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${showMoreModels ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}

              <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">
                  {isOtherDeviceBrand ? "Can't find your device type?" : "Can't find your model?"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isOtherDeviceBrand
                    ? "Enter your exact device model manually."
                    : "Enter your exact model name manually."}
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={customModelName}
                    onChange={(e) => setSelectedModel(`custom:${e.target.value}`)}
                    placeholder={isOtherDeviceBrand ? "Type your device model..." : "Type your model name..."}
                    className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const model = customModelName.trim()
                      if (model) handleModelSelect(`custom:${model}`)
                    }}
                    aria-disabled={!customModelName.trim()}
                    className="rounded-xl border border-[#000000] bg-[#000000] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-[#000000] hover:shadow-[0_12px_24px_rgba(0,0,0,0.32)] hover:ring-2 hover:ring-white/70 hover:ring-offset-1 hover:ring-offset-zinc-200 active:translate-y-0 active:bg-[#000000]"
                  >
                    Use this model
                  </button>
                </div>
                {isCustomModel && customModelName && (
                  <p className="mt-2 text-xs font-medium text-primary">
                    Selected custom model: {customModelName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════
            STEP 4 — Select Service + Book
        ═══════════════════════════════ */}
        {step === 4 && (
          <div className="mt-7 sm:mt-8">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-zinc-300/90 bg-zinc-200 p-5 shadow-[0_18px_42px_rgba(0,0,0,0.08)] sm:p-8">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/45 blur-3xl" />
                <div className="absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-white/80" />
              </div>

              <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-[112px_1fr] sm:items-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-zinc-300 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.10)] sm:mx-0 sm:h-28 sm:w-28">
                  {selectedServiceSlug ? (
                    <FeaturedServiceGlyph slug={selectedServiceSlug} className="h-14 w-14 text-zinc-900" />
                  ) : (
                    <BadgeCheck className="h-12 w-12 text-zinc-900" />
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <p className="inline-flex items-center rounded-full border border-zinc-300 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                    Step 4 of 4
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight text-zinc-900 sm:text-4xl">
                    <span className="text-zinc-500">Choose your</span>
                    <br />
                    <span className="text-zinc-900">service </span>
                    <span className="text-zinc-500">type</span>
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 sm:text-base">
                    For <span className="font-semibold text-zinc-900">{`${brandDisplayName || "Device"} ${modelDisplayName}`.trim()}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                    <span className="rounded-full border border-zinc-300 bg-white/75 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
                      {selectedDeviceLabel}
                    </span>
                    <span className="rounded-full border border-zinc-300 bg-white/75 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
                      {filteredServiceCategories.length} services
                    </span>
                    <span className="rounded-full border border-zinc-300 bg-white/75 px-2.5 py-1 text-[11px] font-medium text-zinc-700">Premium parts</span>
                    <span className="rounded-full border border-zinc-300 bg-white/75 px-2.5 py-1 text-[11px] font-medium text-zinc-700">Certified repair</span>
                    <span className="rounded-full border border-zinc-300 bg-white/75 px-2.5 py-1 text-[11px] font-medium text-zinc-700">Warranty backed</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                {visibleServiceCategories.map((cat, i) => {
                  const Icon = (serviceIconMap[cat.icon] || Settings) as React.ComponentType<{ className?: string }>
                  const isSelected = selectedServiceSlug === cat.slug

                  return (
                    <AnimatedSection key={cat.id} delay={i * 50}>
                      <button
                        onClick={() => handleServiceSelect(cat.slug)}
                        type="button"
                        title={cat.name}
                        aria-label={cat.name}
                        aria-pressed={isSelected}
                        className={`group relative w-full overflow-hidden rounded-[1.3rem] border-[1.5px] px-2.5 py-2.5 text-center transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          isSelected
                            ? "border-zinc-900 bg-zinc-200 shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
                            : "border-zinc-300 bg-zinc-200 hover:-translate-y-0.5 hover:border-black"
                        }`}
                      >
                        <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/85" />
                        <div className="flex h-[8rem] flex-col items-center justify-center gap-1.5 sm:h-[8.6rem]">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm transition-colors ${
                            isSelected
                              ? "border-zinc-900 bg-zinc-900 text-white"
                              : "border-zinc-300 bg-zinc-100 text-zinc-700 group-hover:border-black group-hover:bg-white group-hover:text-zinc-900"
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="line-clamp-2 px-1 text-[0.93rem] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-[1rem]">
                            {cat.name}
                          </p>
                          <p className={`line-clamp-2 px-1 text-[10px] leading-tight sm:text-[11px] ${
                            isSelected ? "text-zinc-600" : "text-zinc-500"
                          }`}>
                            {cat.description}
                          </p>
                        </div>
                      </button>
                    </AnimatedSection>
                  )
                })}
                {filteredServiceCategories.length === 0 && (
                  <p className="col-span-full rounded-xl border border-dashed border-zinc-300 bg-white/70 px-4 py-5 text-center text-sm text-zinc-600">
                    No services available for this device type yet.
                  </p>
                )}
              </div>

              {filteredServiceCategories.length > 8 && (
                <div className="relative mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowMoreServices((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-zinc-900 transition-colors hover:border-black hover:bg-zinc-50"
                  >
                    {showMoreServices ? "Show Less Services" : "View More Services"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${showMoreServices ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}

              <div className="relative mt-6 rounded-xl border border-dashed border-zinc-300 bg-white/70 p-4 sm:p-5">
                <p className="text-sm font-semibold text-zinc-900">
                  Service not listed?
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Describe your problem and we will match it with the right repair service.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <textarea
                    value={customServiceIssue}
                    onChange={(e) => setCustomServiceIssue(e.target.value)}
                    placeholder="Example: My phone restarts randomly and gets hot while charging."
                    className="min-h-[96px] flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-500 focus:border-black focus:ring-2 focus:ring-zinc-900/10"
                  />
                  <button
                    type="button"
                    onClick={handleCustomServiceSubmit}
                    aria-disabled={!customServiceIssue.trim()}
                    className="rounded-xl border border-[#000000] bg-[#000000] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-[#000000] hover:shadow-[0_12px_24px_rgba(0,0,0,0.32)] hover:ring-2 hover:ring-white/70 hover:ring-offset-1 hover:ring-offset-zinc-200 active:translate-y-0 active:bg-[#000000]"
                  >
                    Use this problem
                  </button>
                </div>
              </div>

              <p className="relative mt-4 text-center text-[11px] text-zinc-500 sm:text-xs">
                All repairs include full diagnostics and quality assurance checks.
              </p>

              {selectedServiceSlug && (
                <div className="relative mx-auto mt-7 max-w-3xl rounded-2xl border border-zinc-300 bg-white/90 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-6">
                  <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Service</span>
                      <span className="text-sm font-semibold text-zinc-900">{currentServiceCat?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Device</span>
                      <span className="text-sm font-semibold text-zinc-900">{`${brandDisplayName || "Device"} ${modelDisplayName}`.trim()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <Clock className="h-3.5 w-3.5" /> Time Estimated
                      </span>
                      <span className="text-sm font-semibold text-zinc-900">
                        {matchedRepair?.estimateTime || "Contact us"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <DollarSign className="h-3.5 w-3.5" /> Cost Estimated
                      </span>
                      <span className="text-lg font-bold text-zinc-900">
                        {matchedRepair ? `From $${matchedRepair.estimateCost}` : "Get a quote"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                    <Link
                      href={(() => {
                        const params = new URLSearchParams()
                        if (selectedBrand) params.set("brand", selectedBrand)
                        if (selectedModel) params.set("model", selectedModel)
                        if (selectedDevice) params.set("device", selectedDevice)
                        if (matchedRepair) params.set("serviceId", matchedRepair.id)
                        if (selectedServiceSlug) params.set("serviceSlug", selectedServiceSlug)
                        if (modelDisplayName) params.set("modelName", modelDisplayName)
                        if (brandDisplayName) params.set("brandName", brandDisplayName)
                        if (currentServiceCat?.name) params.set("serviceName", currentServiceCat.name)
                        if (matchedRepair) {
                          params.set("cost", String(matchedRepair.estimateCost))
                          params.set("time", matchedRepair.estimateTime)
                        }
                        return `/book?${params.toString()}`
                      })()}
                      className="flex h-[5.25rem] flex-col items-center justify-center gap-1.5 rounded-xl border border-zinc-900 bg-zinc-900 p-3 text-white transition-all active:brightness-95 hover:shadow-md hover:brightness-110"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-[13px] font-semibold">Book Online</span>
                    </Link>
                    <Link
                      href="/locations"
                      className="flex h-[5.25rem] flex-col items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 transition-all hover:border-black"
                    >
                      <MapPin className="h-5 w-5 text-zinc-900" />
                      <span className="text-[13px] font-semibold">Visit Us</span>
                    </Link>
                    <a
                      href="tel:0297451234"
                      className="flex h-[5.25rem] flex-col items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 transition-all hover:border-black"
                    >
                      <Smartphone className="h-5 w-5 text-zinc-900" />
                      <span className="text-[13px] font-semibold">Call Us</span>
                    </a>
                    <Link
                      href="/quote"
                      className="flex h-[5.25rem] flex-col items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 transition-all hover:border-black"
                    >
                      <ArrowRight className="h-5 w-5 text-zinc-900" />
                      <span className="text-[13px] font-semibold">Get Quote</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center sm:mt-10">
          <Link
            href="/services"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-300 bg-white/85 px-5 text-sm font-medium text-zinc-900 transition-colors hover:border-black hover:bg-white"
          >
            View All Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
