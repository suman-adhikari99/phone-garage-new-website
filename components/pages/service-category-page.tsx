"use client"

import { useState, type ComponentType } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatedSection } from "../animated-section"
import {
  getBrandsByCategory,
  type ServiceCategory,
  type DeviceCategory,
} from "../../lib/data"
import {
  ArrowLeft,
  ChevronRight,
} from "lucide-react"

interface Props {
  category: ServiceCategory
}

const deviceOptions: Array<{
  id: DeviceCategory
  label: string
  description: string
}> = [
  {
    id: "mobile",
    label: "Mobile",
    description: "iPhone, Samsung, Google and more",
  },
  {
    id: "tablet",
    label: "Tablet",
    description: "iPad and Android tablets",
  },
  {
    id: "laptop",
    label: "Laptop",
    description: "MacBook, Dell, HP, Lenovo and more",
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

export function ServiceCategoryPage({ category }: Props) {
  const router = useRouter()
  const [selectedDevice, setSelectedDevice] = useState<DeviceCategory | null>(null)

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push("/services")
  }

  const visibleBrands = selectedDevice ? getBrandsByCategory(selectedDevice) : []

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
              <span className="text-zinc-900">{category.name}</span>
            </nav>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">{category.name}</h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-600">
              {category.description} Continue the same flow as home: choose device, then brand, then model.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">1. Service</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  selectedDevice ? "bg-zinc-900/10 text-zinc-900" : "bg-zinc-900 text-white"
                }`}
              >
                2. Device
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  selectedDevice ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                3. Brand
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-500">4. Model</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-500">5. Book</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {!selectedDevice ? (
            <>
              <AnimatedSection>
                <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
                  Select your device type
                </h2>
              </AnimatedSection>
              <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {deviceOptions.map((option, i) => (
                  <AnimatedSection key={option.id} delay={i * 60}>
                    <button
                      type="button"
                      onClick={() => setSelectedDevice(option.id)}
                      className="group px-3 pb-4 pt-3 text-center transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                    >
                      <div className="flex h-52 items-center justify-center rounded-2xl border border-zinc-300 bg-zinc-200 transition-colors duration-200 group-hover:border-zinc-500 sm:h-60">
                        <DeviceLineDrawing
                          type={option.id}
                          className="h-44 w-44 text-zinc-900 transition-transform duration-200 group-hover:scale-105 sm:h-52 sm:w-52"
                        />
                      </div>
                      <div className="mt-2">
                        <span className="block text-xl font-semibold tracking-tight text-zinc-900">{option.label}</span>
                        <span className="mt-1 block text-sm leading-snug text-zinc-600">{option.description}</span>
                      </div>
                    </button>
                  </AnimatedSection>
                ))}
              </div>
            </>
          ) : (
            <>
              <AnimatedSection>
                <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                    Select your brand
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedDevice(null)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change device
                  </button>
                </div>
                <p className="mx-auto mt-2 max-w-4xl text-sm text-zinc-600">
                  Showing brands for{" "}
                  <span className="font-semibold text-zinc-900">
                    {deviceOptions.find((d) => d.id === selectedDevice)?.label}
                  </span>
                </p>
              </AnimatedSection>
              <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {visibleBrands.map((brand, i) => {
                  const LogoComponent = brandLogos[brand.id]
                  const logoSrc = brandLogoCdn[brand.id]

                  return (
                    <AnimatedSection key={brand.id} delay={i * 60}>
                      <Link
                        href={`/brands/${brand.id}?serviceSlug=${category.slug}&device=${selectedDevice}`}
                        className="group flex flex-col items-center gap-2 rounded-xl px-3 py-2 text-center transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <div className="flex h-[7.5rem] w-[7.5rem] items-center justify-center rounded-2xl border border-zinc-300 bg-zinc-200 transition-colors duration-200 group-hover:border-zinc-500">
                          {logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={`${brand.name} logo`}
                              className="h-[5.5rem] w-[5.5rem] object-contain transition-transform duration-200 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : LogoComponent ? (
                            <LogoComponent className="h-[4.75rem] w-[4.75rem] text-black transition-transform duration-200 group-hover:scale-110" />
                          ) : (
                            <span className="text-lg font-extrabold text-black">{brand.name[0]}</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-zinc-700 transition-colors group-hover:text-zinc-900">{brand.name}</span>
                      </Link>
                    </AnimatedSection>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
