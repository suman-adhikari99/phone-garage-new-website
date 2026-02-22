"use client"

import { useState, useCallback, type FormEvent } from "react"
import { cn } from "../lib/utils"
import {
  brands,
  models,
  getModelsByBrand,
  getServicesByModel,
  stores,
  getBrandsByCategory,
  serviceCategories,
  type DeviceCategory,
} from "../lib/data"
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Search,
  Wrench,
  Smartphone as SmartphoneIcon,
  Tablet,
  Laptop,
  Star,
  MonitorSmartphone,
  BatteryCharging,
  Camera,
  PlugZap,
  Droplets,
  HardDrive,
  Settings,
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
  Unlock,
  Keyboard,
  CircuitBoard,
  FlipVertical,
  Thermometer,
  MemoryStick,
  MousePointer,
  X,
  PenLine,
} from "lucide-react"

/* ─── Icon map for service categories ─── */
const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "monitor-smartphone": MonitorSmartphone,
  "battery-charging": BatteryCharging,
  camera: Camera,
  "plug-zap": PlugZap,
  droplets: Droplets,
  "hard-drive": HardDrive,
  smartphone: SmartphoneIcon,
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

/* ─── Device type config ─── */
const deviceTypes: { id: DeviceCategory; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: "mobile", label: "Mobile Phone", icon: SmartphoneIcon, desc: "iPhone, Samsung, Google & more" },
  { id: "tablet", label: "Tablet / iPad", icon: Tablet, desc: "iPad, Samsung Tab & more" },
  { id: "laptop", label: "Laptop", icon: Laptop, desc: "MacBook, Dell, HP & more" },
]

function createIdempotencyKey(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

interface BookingModuleProps {
  className?: string
  compact?: boolean
  preselectedBrand?: string
  preselectedModel?: string
  preselectedService?: string
  preselectedBrandName?: string
  preselectedModelName?: string
  preselectedServiceName?: string
  preselectedCost?: string
  preselectedTime?: string
}

/*
  Steps:
  1 = Select Service
  2 = Device Type
  3 = Brand
  4 = Model
  5 = Store
  6 = Contact Details
  7 = Confirmation
*/
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

export function BookingModule({
  className,
  compact = false,
  preselectedBrand,
  preselectedModel,
  preselectedService,
  preselectedBrandName,
  preselectedModelName,
  preselectedServiceName,
  preselectedCost,
  preselectedTime,
}: BookingModuleProps) {
  const hasFullPreselection = !!(preselectedBrand && preselectedModel && preselectedServiceName)
  const hasBrandModelOnly = !!(preselectedBrand && preselectedModel && !preselectedServiceName)

  function getInitialStep(): Step {
    if (hasFullPreselection) return 5
    if (hasBrandModelOnly) return 1
    return 1
  }

  const [step, setStep] = useState<Step>(getInitialStep())
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<DeviceCategory | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(preselectedBrand || null)
  const [selectedModel, setSelectedModel] = useState<string | null>(preselectedModel || null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(preselectedService || null)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [serviceSearch, setServiceSearch] = useState("")
  const [modelSearch, setModelSearch] = useState("")
  const [customModelInput, setCustomModelInput] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", notes: "" })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedBookingRef, setSavedBookingRef] = useState<string | null>(null)

  // Derived data
  const isCustomModel = selectedModel?.startsWith("custom:") || false
  const customModelName = isCustomModel ? selectedModel!.replace("custom:", "") : ""
  const brandObj = brands.find((b) => b.id === selectedBrand)
  const modelObj = isCustomModel ? null : models.find((m) => m.id === selectedModel)
  const displayBrandName = brandObj?.name || preselectedBrandName || ""
  const displayModelName = isCustomModel ? customModelName : (modelObj?.name || preselectedModelName || "")
  const displayServiceName = preselectedServiceName || serviceCategories.find((c) => c.slug === selectedServiceSlug)?.name || ""

  const currentCategoryBrands = selectedDevice ? getBrandsByCategory(selectedDevice) : []
  const availableModels = selectedBrand ? getModelsByBrand(selectedBrand) : []
  const availableServices = selectedModel && !isCustomModel ? getServicesByModel(selectedModel) : []
  const currentService = availableServices.find((s) => s.id === selectedServiceId)
  const selectedStoreObj = stores.find((s) => s.id === selectedStore)

  // Filter services by search
  const filteredServices = serviceSearch.trim()
    ? serviceCategories.filter(
        (c) =>
          c.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
          c.description.toLowerCase().includes(serviceSearch.toLowerCase())
      )
    : serviceCategories

  // Filter models by search
  const filteredModels = modelSearch
    ? availableModels.filter((m) => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
    : availableModels

  // Cost/time display
  const costDisplay = preselectedCost || (currentService ? String(currentService.estimateCost) : "")
  const timeDisplay = preselectedTime || currentService?.estimateTime || ""

  // ─── Handlers ───
  const handleServiceCatSelect = useCallback((slug: string) => {
    setSelectedServiceSlug(slug)
    setServiceSearch("")

    if (preselectedBrand && preselectedModel) {
      const catName = serviceCategories.find((c) => c.slug === slug)?.name || ""
      const keyword = catName.split(" ")[0].toLowerCase()
      const matched = preselectedModel.startsWith("custom:")
        ? null
        : getServicesByModel(preselectedModel).find((s) => s.name.toLowerCase().includes(keyword))
      if (matched) setSelectedServiceId(matched.id)
      setStep(5)
      return
    }

    setSelectedDevice(null)
    setSelectedBrand(null)
    setSelectedModel(null)
    setSelectedServiceId(null)
    setStep(2)
  }, [preselectedBrand, preselectedModel])

  const handleDeviceSelect = useCallback((device: DeviceCategory) => {
    setSelectedDevice(device)
    setSelectedBrand(null)
    setSelectedModel(null)
    setSelectedServiceId(null)
    setStep(3)
  }, [])

  const handleBrandSelect = useCallback((brandId: string) => {
    setSelectedBrand(brandId)
    setSelectedModel(null)
    setSelectedServiceId(null)
    setModelSearch("")
    setShowCustomInput(false)
    setCustomModelInput("")
    setStep(4)
  }, [])

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModel(modelId)
    setSelectedServiceId(null)
    setModelSearch("")
    setShowCustomInput(false)

    if (selectedServiceSlug) {
      const catName = serviceCategories.find((c) => c.slug === selectedServiceSlug)?.name || ""
      const keyword = catName.split(" ")[0].toLowerCase()
      const matched = getServicesByModel(modelId).find((s) => s.name.toLowerCase().includes(keyword))
      if (matched) setSelectedServiceId(matched.id)
    }

    setStep(5)
  }, [selectedServiceSlug])

  const handleCustomModelSubmit = useCallback(() => {
    if (!customModelInput.trim()) return
    setSelectedModel(`custom:${customModelInput.trim()}`)
    setSelectedServiceId(null)
    setModelSearch("")
    setShowCustomInput(false)
    setCustomModelInput("")
    setStep(5)
  }, [customModelInput])

  const handleStoreSelect = useCallback((storeId: string) => {
    setSelectedStore(storeId)
    setStep(6)
  }, [])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = "Name is required"
    if (!formData.phone.trim()) errors.phone = "Phone is required"
    else if (!/^\d{8,15}$/.test(formData.phone)) errors.phone = "Phone number must contain only digits (8-15)"
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitError(null)
    setSavedBookingRef(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": createIdempotencyKey("booking"),
        },
        body: JSON.stringify({
          brandId: selectedBrand || null,
          brandName: displayBrandName || null,
          modelId: selectedModel || null,
          modelName: displayModelName || null,
          serviceId: selectedServiceId || null,
          serviceSlug: selectedServiceSlug || null,
          serviceName: displayServiceName || null,
          estimatedCost: costDisplay || null,
          estimatedTime: timeDisplay || null,
          appointmentDate: new Date().toISOString(),
          appointmentTime: "Not specified",
          storeLocation: selectedStoreObj?.address || selectedStoreObj?.name || "Not specified",
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email || null,
          company: null,
          issueNotes: formData.notes || null,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; bookingRef?: string }
        | null

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to save booking. Please try again.")
      }

      const bookingRef = payload?.bookingRef || null
      setSavedBookingRef(bookingRef)

      const successPath = bookingRef
        ? `/booking-success?bookingRef=${encodeURIComponent(bookingRef)}`
        : "/booking-success"
      window.location.href = successPath
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save booking. Please try again."
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const goBack = () => {
    if (hasFullPreselection) {
      if (step === 6) setStep(5)
      return
    }
    if (hasBrandModelOnly) {
      if (step === 6) { setStep(5); return }
      if (step === 5) { setStep(1); return }
      return
    }
    if (step > 1) setStep((step - 1) as Step)
  }

  const resetBooking = () => {
    setStep(hasFullPreselection ? 5 : 1)
    if (!hasFullPreselection) {
      setSelectedServiceSlug(null)
      setSelectedDevice(null)
      setSelectedBrand(preselectedBrand || null)
      setSelectedModel(preselectedModel || null)
      setSelectedServiceId(null)
      setServiceSearch("")
      setModelSearch("")
    }
    setSelectedStore(null)
    setFormData({ name: "", phone: "", email: "", notes: "" })
    setFormErrors({})
    setSubmitError(null)
    setSavedBookingRef(null)
    setIsSubmitting(false)
  }

  // ─── Progress ───
  const totalSteps = hasFullPreselection ? 2 : hasBrandModelOnly ? 3 : 6
  const currentProgress = hasFullPreselection
    ? (step === 5 ? 1 : 2)
    : hasBrandModelOnly
      ? (step === 1 ? 1 : step === 5 ? 2 : 3)
      : Math.min(step, 6)

  const stepLabels: Record<number, string> = {
    1: "Select Service",
    2: "Device Type",
    3: "Select Brand",
    4: "Select Model",
    5: "Select Store",
    6: "Your Details",
    7: "Booking Confirmed",
  }

  const currentLabel = step === 7
    ? "Booking Confirmed"
    : hasFullPreselection
      ? (step === 5 ? "Select Store" : "Your Details")
      : hasBrandModelOnly
        ? (step === 1 ? "Select Service" : step === 5 ? "Select Store" : "Your Details")
        : stepLabels[step] || "Book a Repair"

  // ─── Breadcrumb trail ───
  const breadcrumbs: string[] = []
  if (displayServiceName) breadcrumbs.push(displayServiceName)
  if (selectedDevice) breadcrumbs.push(deviceTypes.find(d => d.id === selectedDevice)?.label || "")
  if (displayBrandName) breadcrumbs.push(displayBrandName)
  if (displayModelName) breadcrumbs.push(displayModelName)

  return (
    <div className={cn("w-full rounded-2xl border border-border bg-card shadow-sm", className)}>

      {/* ═══ Pre-selection Summary ═══ */}
      {hasFullPreselection && step < 7 && (
        <div className="border-b border-border bg-primary/[0.03] px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your selection</p>
          <div className="flex flex-wrap gap-2">
            {displayServiceName && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                <Wrench className="h-3 w-3 text-primary" />
                {displayServiceName}
              </span>
            )}
            {displayBrandName && displayModelName && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                <SmartphoneIcon className="h-3 w-3 text-primary" />
                {displayBrandName} {displayModelName}
              </span>
            )}
            {timeDisplay && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-border px-2.5 py-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 text-primary" />
                {timeDisplay}
              </span>
            )}
            {costDisplay && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary">
                <DollarSign className="h-3 w-3" />
                From ${costDisplay}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ═══ Progress Header ═══ */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-card-foreground">{currentLabel}</h3>
          {step < 7 && (
            <span className="text-xs font-medium text-muted-foreground">
              Step {currentProgress} of {totalSteps}
            </span>
          )}
        </div>
        {step < 7 && (
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className={cn("h-1 flex-1 rounded-full transition-all duration-300", s <= currentProgress ? "bg-primary" : "bg-border")} />
            ))}
          </div>
        )}
        {/* Breadcrumb trail */}
        {step > 1 && step < 7 && !hasFullPreselection && breadcrumbs.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={i === breadcrumbs.length - 1 ? "font-medium text-foreground" : ""}>{crumb}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Step Content ═══ */}
      <div className="px-5 py-5">

        {/* ── Step 1: Service Category ── */}
        {step === 1 && !hasFullPreselection && (
          <div>
            <p className="mb-3 text-sm text-muted-foreground">What do you need repaired?</p>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              {serviceSearch && (
                <button onClick={() => setServiceSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto rounded-xl">
              <div className="grid grid-cols-1 gap-1.5">
                {filteredServices.map((cat) => {
                  const Icon = serviceIconMap[cat.icon] || Settings
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleServiceCatSelect(cat.slug)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition-all duration-200",
                        "hover:border-primary/30 hover:bg-primary/[0.03]",
                        selectedServiceSlug === cat.slug && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-card-foreground">{cat.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  )
                })}
                {filteredServices.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground">No services match &ldquo;{serviceSearch}&rdquo;</p>
                    <button onClick={() => setServiceSearch("")} className="mt-2 text-sm font-medium text-primary hover:underline">
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Device Type ── */}
        {step === 2 && !hasFullPreselection && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <button type="button" onClick={goBack} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm text-muted-foreground">What type of device?</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {deviceTypes.map((dt) => {
                const Icon = dt.icon
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => handleDeviceSelect(dt.id)}
                    className={cn(
                      "group flex items-center gap-4 rounded-xl border-2 border-border p-5 text-left transition-all duration-200",
                      "hover:border-primary hover:shadow-sm",
                      selectedDevice === dt.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-card-foreground">{dt.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{dt.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Brand ── */}
        {step === 3 && !hasFullPreselection && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <button type="button" onClick={goBack} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm text-muted-foreground">Select your brand</p>
            </div>
            <div className={cn("grid gap-2", currentCategoryBrands.length <= 3 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3")}>
              {currentCategoryBrands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => handleBrandSelect(brand.id)}
                  className={cn(
                    "group flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center transition-all duration-200",
                    "hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-sm",
                    selectedBrand === brand.id && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-secondary-foreground">
                    {brand.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{brand.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Model ── */}
        {step === 4 && !hasFullPreselection && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <button type="button" onClick={goBack} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm text-muted-foreground">Select your model</p>
            </div>

            {/* Search models */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search models..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              {modelSearch && (
                <button onClick={() => setModelSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-[280px] overflow-y-auto rounded-xl">
              <div className="grid grid-cols-1 gap-1.5">
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleModelSelect(model.id)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border border-border px-4 py-3 text-left transition-all duration-200",
                      "hover:border-primary/30 hover:bg-primary/[0.03]",
                      selectedModel === model.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div>
                      <span className="text-sm font-medium text-card-foreground">{model.name}</span>
                      {model.year && <span className="ml-2 text-xs text-muted-foreground">{model.year}</span>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}

                {filteredModels.length === 0 && !showCustomInput && (
                  <div className="px-4 py-4 text-center">
                    <p className="text-sm text-muted-foreground">No models found{modelSearch ? ` for "${modelSearch}"` : ""}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Custom model entry */}
            <div className="mt-3 border-t border-border pt-3">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/[0.03] hover:text-foreground"
                >
                  <PenLine className="h-4 w-4" />
                  My model is not listed — enter manually
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter your model name..."
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCustomModelSubmit() }}
                    autoFocus
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCustomModelSubmit}
                    disabled={!customModelInput.trim()}
                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 5: Store ── */}
        {step === 5 && (
          <div>
            {!hasFullPreselection && (
              <div className="mb-4 flex items-center gap-2">
                <button type="button" onClick={goBack} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm text-muted-foreground">Select your preferred store</p>
              </div>
            )}
            {hasFullPreselection && (
              <p className="mb-4 text-sm text-muted-foreground">Choose a store for your repair</p>
            )}
            <div className="grid grid-cols-1 gap-2">
              {stores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => handleStoreSelect(store.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border border-border px-4 py-3.5 text-left transition-all duration-200",
                    "hover:border-primary/30 hover:bg-primary/[0.03]",
                    selectedStore === store.id && "border-primary bg-primary/5"
                  )}
                >
                  <div>
                    <span className="text-sm font-medium text-card-foreground">{store.name}</span>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {store.address}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{store.hours}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                      <Star className="h-3 w-3 fill-amber-500" />
                      {store.rating}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{store.reviewCount} reviews</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 6: Contact Details ── */}
        {step === 6 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <button type="button" onClick={goBack} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm text-muted-foreground">Your contact details</p>
            </div>

            {/* Booking summary */}
            <div className="mb-4 rounded-xl bg-secondary/50 p-3">
              <div className="space-y-1.5 text-xs">
                {displayServiceName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium text-foreground">{displayServiceName}</span>
                  </div>
                )}
                {displayBrandName && displayModelName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device</span>
                    <span className="font-medium text-foreground">{displayBrandName} {displayModelName}</span>
                  </div>
                )}
                {selectedStoreObj && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Store</span>
                    <span className="font-medium text-foreground">{selectedStoreObj.name}</span>
                  </div>
                )}
                {costDisplay && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimate</span>
                    <span className="font-semibold text-primary">
                      {isCustomModel ? "Contact us for quote" : `From $${costDisplay}`}
                    </span>
                  </div>
                )}
                {!costDisplay && isCustomModel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimate</span>
                    <span className="font-semibold text-primary">Contact us for quote</span>
                  </div>
                )}
                {timeDisplay && !isCustomModel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">{timeDisplay}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (formErrors.name) setFormErrors({ ...formErrors, name: "" }) }}
                  className={cn(
                    "w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                    formErrors.name ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"
                  )}
                />
                {formErrors.name && <p className="mt-1 text-xs text-destructive">{formErrors.name}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => { setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 15) }); if (formErrors.phone) setFormErrors({ ...formErrors, phone: "" }) }}
                  className={cn(
                    "w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                    formErrors.phone ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"
                  )}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
                />
                {formErrors.phone && <p className="mt-1 text-xs text-destructive">{formErrors.phone}</p>}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (formErrors.email) setFormErrors({ ...formErrors, email: "" }) }}
                  className={cn(
                    "w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                    formErrors.email ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"
                  )}
                />
                {formErrors.email && <p className="mt-1 text-xs text-destructive">{formErrors.email}</p>}
              </div>
              <textarea
                placeholder="Additional notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              {submitError && <p className="text-xs text-destructive">{submitError}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Confirm Booking"}
              </button>
            </form>
          </div>
        )}

        {/* ── Step 7: Confirmation ── */}
        {step === 7 && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <h4 className="mt-4 text-lg font-semibold text-card-foreground">Booking Received!</h4>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              We&apos;ll confirm your appointment shortly via phone.
            </p>
            {savedBookingRef && (
              <p className="mt-2 rounded-lg border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                Ref: {savedBookingRef}
              </p>
            )}

            {/* Confirmation summary */}
            <div className="mt-4 w-full max-w-sm rounded-xl bg-secondary/50 p-4 text-left">
              <div className="space-y-2 text-xs">
                {displayServiceName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium text-foreground">{displayServiceName}</span>
                  </div>
                )}
                {displayBrandName && displayModelName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device</span>
                    <span className="font-medium text-foreground">{displayBrandName} {displayModelName}</span>
                  </div>
                )}
                {selectedStoreObj && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Store</span>
                    <span className="font-medium text-foreground">{selectedStoreObj.name}</span>
                  </div>
                )}
                {formData.name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium text-foreground">{formData.name}</span>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium text-foreground">{formData.phone}</span>
                  </div>
                )}
                {formData.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground truncate max-w-[180px]">{formData.email}</span>
                  </div>
                )}
                {costDisplay && !isCustomModel && (
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="text-muted-foreground">Estimate</span>
                    <span className="font-semibold text-primary">From ${costDisplay}</span>
                  </div>
                )}
                {isCustomModel && (
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="text-muted-foreground">Estimate</span>
                    <span className="font-semibold text-primary">We&apos;ll contact you with a quote</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {selectedStoreObj && (
                <a
                  href={`tel:${selectedStoreObj.phone.replace(/\D/g, "")}`}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
                >
                  <Phone className="h-4 w-4" />
                  Call Store
                </a>
              )}
              <button
                type="button"
                onClick={resetBooking}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-card-foreground transition-colors hover:bg-secondary"
              >
                New Booking
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions footer */}
      {step < 7 && (
        <div className="flex items-center justify-center gap-4 border-t border-border px-5 py-3">
          <a href="tel:0403983009" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            <Phone className="h-3.5 w-3.5" />
            Call
          </a>
          <a href="mailto:hello@phonegarage.com.au" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            <Mail className="h-3.5 w-3.5" />
            Email
          </a>
          <a href="/#visit-us" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Visit
          </a>
        </div>
      )}
    </div>
  )
}
