"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatedSection } from "../animated-section"
import { serviceCategories, brands } from "../../lib/data"
import {
  MonitorSmartphone, BatteryCharging, Camera, PlugZap, Droplets, HardDrive, Smartphone, Settings, ArrowRight,
  Volume2, Mic, Headphones, Power, Fingerprint, Vibrate, ScanFace, Monitor, Hand,
  Wifi, Signal, CreditCard, ArrowLeftRight, ShieldAlert, Shield, Unlock,
  Keyboard, CircuitBoard, FlipVertical, Thermometer, MemoryStick, MousePointer,
  Search, Clock, Star, Phone, Wrench, ChevronRight, X, ArrowLeft,
} from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
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

/* ─── Service groups for organized display ─── */
const serviceGroups = [
  {
    label: "Core Repairs",
    description: "The most common device repairs",
    slugs: ["screen-repair", "battery-replacement", "camera-repair", "charging-port", "water-damage", "back-glass"],
  },
  {
    label: "Audio & Connectivity",
    description: "Sound and audio component fixes",
    slugs: ["speaker-repair", "microphone-repair", "headphone-jack"],
  },
  {
    label: "Buttons & Physical",
    description: "Physical buttons and haptic components",
    slugs: ["power-button", "home-button", "vibration-motor"],
  },
  {
    label: "Display & Sensors",
    description: "Advanced display and sensor repairs",
    slugs: ["face-id-repair", "lcd-replacement", "touch-screen"],
  },
  {
    label: "Network & Connectivity",
    description: "Wi-Fi, cellular and network fixes",
    slugs: ["wifi-bluetooth", "signal-repair", "sim-card-tray"],
  },
  {
    label: "Software & Data",
    description: "Software, data and security services",
    slugs: ["software-issues", "data-recovery", "data-transfer", "virus-removal"],
  },
  {
    label: "Accessories & Protection",
    description: "Device protection and unlocking",
    slugs: ["screen-protector", "device-unlocking"],
  },
  {
    label: "Laptop Repairs",
    description: "Laptop-specific hardware repairs",
    slugs: ["keyboard-repair", "motherboard-repair", "hinge-repair", "fan-overheating", "storage-upgrade", "trackpad-repair"],
  },
]

/* Popular service slugs get a badge */
const popularSlugs = new Set([
  "screen-repair", "battery-replacement", "charging-port", "camera-repair", "water-damage", "speaker-repair", "software-issues",
])

export function ServicesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const tabsRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push("/")
  }

  /* Track when tabs become sticky */
  useEffect(() => {
    const el = tabsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 1, rootMargin: "-1px 0px 0px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* Scroll-spy: track which group is in view */
  useEffect(() => {
    const entries = Object.entries(groupRefs.current).filter(([, el]) => el !== null)
    if (entries.length === 0) return
    const observer = new IntersectionObserver(
      (observedEntries) => {
        for (const entry of observedEntries) {
          if (entry.isIntersecting) {
            setActiveGroup(entry.target.getAttribute("data-group"))
          }
        }
      },
      { threshold: 0.2, rootMargin: "-120px 0px -50% 0px" }
    )
    entries.forEach(([, el]) => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [searchQuery])

  const scrollToGroup = (label: string) => {
    const el = groupRefs.current[label]
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  /* Filter services by search */
  const filteredCategories = searchQuery.trim()
    ? serviceCategories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : serviceCategories

  const filteredSlugs = new Set(filteredCategories.map((c) => c.slug))

  const filteredGroups = serviceGroups
    .map((g) => ({
      ...g,
      slugs: g.slugs.filter((s) => filteredSlugs.has(s)),
    }))
    .filter((g) => g.slugs.length > 0)

  const totalResults = filteredCategories.length

  return (
    <div>
      {/* ═══ Hero ═══ */}
      <section className="border-b border-border bg-background-secondary py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedSection>
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Services</p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              What can we fix for you?
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {serviceCategories.length}+ professional repair services for phones, tablets and laptops. Quality parts, fast turnaround, and warranty on every repair.
            </p>
          </AnimatedSection>

          {/* ═══ Search bar ═══ */}
          <AnimatedSection delay={100} className="mt-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services — e.g. screen, battery, speaker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card py-3.5 pl-12 pr-12 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-3 text-sm text-muted-foreground">
                {totalResults === 0 ? "No services found" : `${totalResults} service${totalResults !== 1 ? "s" : ""} found`}
                {" "}for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </AnimatedSection>

          {/* ═══ Quick stats ═══ */}
          <AnimatedSection delay={200} className="mt-8">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Wrench className="h-4 w-4 text-primary" />
                </div>
                <span><strong className="text-foreground">{serviceCategories.length}</strong> repair services</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <span>Most repairs in <strong className="text-foreground">under 1 hour</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span><strong className="text-foreground">Warranty</strong> on every repair</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Sticky category tabs ═══ */}
      {!searchQuery && (
        <>
          <div ref={tabsRef} />
          <div className={`sticky top-0 z-30 border-b border-border backdrop-blur-sm transition-shadow ${isSticky ? "shadow-sm" : ""}`}>
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
                {serviceGroups.map((g) => (
                  <button
                    key={g.label}
                    onClick={() => scrollToGroup(g.label)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      activeGroup === g.label
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ Service groups ═══ */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="space-y-16">
            {filteredGroups.map((group, gi) => (
              <div
                key={group.label}
                ref={(el) => { groupRefs.current[group.label] = el }}
                data-group={group.label}
              >
                <AnimatedSection delay={gi * 40}>
                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{group.label}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
                    </div>
                    <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                      {group.slugs.length} service{group.slugs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.slugs.map((slug, si) => {
                    const cat = serviceCategories.find((c) => c.slug === slug)
                    if (!cat) return null
                    const Icon = (iconMap[cat.icon] || Settings) as React.ComponentType<{ className?: string }>
                    const isPopular = popularSlugs.has(slug)

                    return (
                      <AnimatedSection key={cat.id} delay={gi * 40 + si * 50}>
                        <Link
                          href={`/services/${cat.slug}`}
                          className="group relative flex h-full flex-col overflow-hidden rounded-[1.3rem] border-[1.5px] border-zinc-300 bg-zinc-200 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-black active:scale-[0.99]"
                        >
                          <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/85" />

                          {isPopular && (
                            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                              <Star className="h-3 w-3" />
                              Popular
                            </span>
                          )}

                          <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-zinc-100 text-zinc-700 shadow-sm transition-colors group-hover:border-black group-hover:bg-white group-hover:text-zinc-900">
                            <Icon className="h-5 w-5" />
                          </div>

                          <h3 className="mt-3 line-clamp-2 text-[0.98rem] font-semibold leading-tight tracking-tight text-zinc-900">
                            {cat.name}
                          </h3>
                          <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-zinc-600">
                            {cat.description}
                          </p>

                          <div className="mt-4 flex items-center justify-end">
                            <span className="flex items-center gap-1 text-sm font-medium text-zinc-900">
                              View details
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </Link>
                      </AnimatedSection>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {totalResults === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">No services found</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                We couldn&apos;t find a service matching &ldquo;{searchQuery}&rdquo;. Try a different search term or browse the categories.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══ CTA banner ═══ */}
      <section className="border-y border-border bg-primary/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <AnimatedSection>
            <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
              <div className="flex-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Not sure what you need?</h2>
                <p className="mt-2 max-w-lg text-muted-foreground">
                  Bring your device in for a free diagnostic assessment. Our technicians will identify the issue and provide a no-obligation quote.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/book"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-110"
                >
                  Book a Repair
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="tel:0297451234"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                >
                  <Phone className="h-4 w-4" />
                  Call Us
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  )
}
