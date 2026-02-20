"use client"

import { useState, type ComponentType } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatedSection } from "../animated-section"
import {
  getServicesByModel,
  serviceCategories,
  type Brand,
  type DeviceCategory,
  type Model,
} from "../../lib/data"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"

interface Props {
  brand: Brand
  models: Model[]
}

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 384 512" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

const brandLogos: Record<string, ComponentType<{ className?: string }>> = {
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

const trailingKeywords = ["Max", "Plus", "Mini", "Ultra", "Pro", "Air", "SE", "FE", "Fold", "Flip"]

export function BrandPage({ brand, models }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMoreModels, setShowMoreModels] = useState(false)
  const [customModelInput, setCustomModelInput] = useState("")

  const serviceSlug = searchParams.get("serviceSlug")
  const serviceCategory = serviceSlug ? serviceCategories.find((category) => category.slug === serviceSlug) : null
  const device = searchParams.get("device")
  const selectedDevice: DeviceCategory | null =
    device === "mobile" || device === "tablet" || device === "laptop" ? device : null

  const deviceLabelMap: Record<DeviceCategory, string> = {
    mobile: "Mobile",
    tablet: "Tablet",
    laptop: "Laptop",
  }

  const contextParams = new URLSearchParams()
  if (serviceCategory) contextParams.set("serviceSlug", serviceCategory.slug)
  if (selectedDevice) contextParams.set("device", selectedDevice)
  const contextQuery = contextParams.toString()
  const contextQuerySuffix = contextQuery ? `?${contextQuery}` : ""
  const logoSrc = brandLogoCdn[brand.id]
  const LogoComponent = brandLogos[brand.id]

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(serviceCategory ? `/services/${serviceCategory.slug}` : "/services")
  }

  const visibleModels = showMoreModels ? models : models.slice(0, 9)
  const customModel = customModelInput.trim()

  const buildCustomBookHref = (modelName: string) => {
    const params = new URLSearchParams()
    params.set("brand", brand.id)
    params.set("brandName", brand.name)
    params.set("model", `custom:${modelName}`)
    params.set("modelName", modelName)
    if (serviceCategory) {
      params.set("serviceSlug", serviceCategory.slug)
      params.set("serviceName", serviceCategory.name)
    }
    if (selectedDevice) params.set("device", selectedDevice)
    return `/book?${params.toString()}`
  }

  const buildModelHref = (model: Model) => {
    if (!serviceCategory) {
      return `/brands/${brand.id}/${model.id}${contextQuerySuffix}`
    }

    const params = new URLSearchParams()
    params.set("brand", brand.id)
    params.set("brandName", brand.name)
    params.set("model", model.id)
    params.set("modelName", model.name)
    params.set("serviceSlug", serviceCategory.slug)
    params.set("serviceName", serviceCategory.name)
    if (selectedDevice) params.set("device", selectedDevice)

    const availableServices = getServicesByModel(model.id)
    const exactMatch = availableServices.find(
      (service) => service.name.toLowerCase() === serviceCategory.name.toLowerCase()
    )
    const keyword = serviceCategory.name.split(" ")[0]?.toLowerCase() || ""
    const keywordMatch =
      !exactMatch && keyword
        ? availableServices.find((service) => service.name.toLowerCase().includes(keyword))
        : undefined
    const matchedService = exactMatch || keywordMatch

    if (matchedService) {
      params.set("serviceId", matchedService.id)
      params.set("cost", String(matchedService.estimateCost))
      params.set("time", matchedService.estimateTime)
    }

    return `/book?${params.toString()}`
  }

  return (
    <div className="bg-zinc-200">
      <section className="border-b border-zinc-300 bg-zinc-200 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedSection>
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
            <nav className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Link href="/services" className="transition-colors hover:text-zinc-900">Services</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              {serviceCategory && (
                <>
                  <Link href={`/services/${serviceCategory.slug}`} className="transition-colors hover:text-zinc-900">
                    {serviceCategory.name}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              <span className="text-zinc-900">{brand.name}</span>
            </nav>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-300 bg-white text-2xl font-bold text-zinc-900 shadow-sm">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={`${brand.name} logo`}
                    className="h-10 w-10 object-contain"
                    loading="lazy"
                  />
                ) : LogoComponent ? (
                  <LogoComponent className="h-9 w-9 text-zinc-900" />
                ) : (
                  brand.name[0]
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{brand.name} Repair</h1>
                <p className="mt-1 text-zinc-600">{brand.modelCount} models available for repair</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  serviceCategory ? "bg-zinc-900/10 text-zinc-900" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                1. Service
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  selectedDevice ? "bg-zinc-900/10 text-zinc-900" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                2. Device{selectedDevice ? ` (${deviceLabelMap[selectedDevice]})` : ""}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">3. Brand</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-500">4. Model</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-500">5. Book</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedSection>
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-zinc-300 bg-zinc-200 p-5 sm:p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[120px_1fr] sm:items-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-zinc-300 bg-white shadow-[0_8px_22px_rgba(0,0,0,0.10)] sm:mx-0 sm:h-28 sm:w-28">
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      alt={`${brand.name} logo`}
                      className="h-16 w-16 object-contain"
                      loading="lazy"
                    />
                  ) : LogoComponent ? (
                    <LogoComponent className="h-14 w-14 text-zinc-900" />
                  ) : (
                    <span className="text-3xl font-extrabold text-zinc-900">{brand.name[0]}</span>
                  )}
                </div>
                <h2 className="text-center text-2xl font-semibold leading-tight text-zinc-900 sm:text-left sm:text-4xl">
                  <span className="text-zinc-500">Choose your</span>
                  <br />
                  <span className="text-zinc-900">{brand.name} </span>
                  <span className="text-zinc-500">model</span>
                </h2>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {visibleModels.map((model) => {
                  const modelName = model.name.replace(brand.name, "").trim() || model.name
                  const words = modelName.split(/\s+/).filter(Boolean)
                  const topLabel = words.length > 1 ? words[0] : brand.name
                  const remainingWords = words.length > 1 ? words.slice(1) : words
                  const lastWord = remainingWords[remainingWords.length - 1]
                  const hasBottom = remainingWords.length > 1 && trailingKeywords.includes(lastWord)
                  const mainLabel = hasBottom ? remainingWords.slice(0, -1).join(" ") : remainingWords.join(" ")
                  const bottomLabel = hasBottom ? lastWord : ""

                  return (
                    <Link
                      key={model.id}
                      href={buildModelHref(model)}
                      className="rounded-[1.45rem] border-2 border-zinc-300 bg-transparent px-2 py-2 text-center text-zinc-900 transition-all duration-200 hover:border-black"
                    >
                      <div className="flex h-24 flex-col items-center justify-center sm:h-28">
                        <p className="text-[11px] text-zinc-500 sm:text-xs">{topLabel}</p>
                        <p className="mt-1 line-clamp-2 text-[1.15rem] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-[1.3rem]">
                          {mainLabel || modelName}
                        </p>
                        <p className="mt-1 text-[1rem] leading-none text-zinc-500 sm:text-[1.15rem]">
                          {bottomLabel || "\u00A0"}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {models.length > 9 && (
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

              <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white/80 p-4">
                <p className="text-sm font-semibold text-zinc-900">Can&apos;t find your model?</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Enter your exact model manually and continue booking.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={customModelInput}
                    onChange={(event) => setCustomModelInput(event.target.value)}
                    placeholder="Type your model name..."
                    className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-500 focus:border-black focus:ring-2 focus:ring-zinc-900/10"
                  />
                  {customModel ? (
                    <Link
                      href={buildCustomBookHref(customModel)}
                      className="rounded-xl border border-black bg-black px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
                    >
                      Use this model
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="rounded-xl border border-black bg-black px-4 py-3 text-sm font-semibold text-white opacity-50"
                    >
                      Use this model
                    </button>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
