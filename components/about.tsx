"use client"

import { useEffect, useState } from "react"
import {
  Award,
  Clock,
  Shield,
  ShieldCheck,
  Star,
  Users,
  Wrench,
} from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

type GoogleReviewsSummaryResponse = {
  rating?: unknown
  reviewCount?: unknown
}

const features = [
  {
    icon: Wrench,
    title: "Expert Technicians",
    description:
      "Our team has over 10 years of combined experience repairing all major phone brands.",
  },
  {
    icon: Star,
    title: "Quality Parts",
    description:
      "We use only premium OEM and high-quality aftermarket parts for every repair.",
  },
  {
    icon: Users,
    title: "Customer First",
    description:
      "Transparent pricing, no hidden fees, and honest advice you can trust.",
  },
]

const guarantees = [
  {
    icon: Wrench,
    text: "Free diagnostic on all devices",
  },
  {
    icon: ShieldCheck,
    text: "No fix, no fee guarantee",
  },
  {
    icon: Clock,
    text: "Same-day repairs for most issues",
  },
  {
    icon: Award,
    text: "6-month warranty on all repairs",
  },
  {
    icon: Star,
    text: "Genuine & premium quality parts",
  },
  {
    icon: Shield,
    text: "Data safety and privacy assured",
  },
]

export function About() {
  const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation()
  const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation(0.08)
  const [googleRating, setGoogleRating] = useState<number | null>(null)
  const [googleReviewCount, setGoogleReviewCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadGoogleSummary() {
      try {
        const res = await fetch("/api/google-reviews", { cache: "no-store" })
        if (!res.ok) return

        const data = (await res.json()) as GoogleReviewsSummaryResponse
        const rating =
          typeof data.rating === "number" && Number.isFinite(data.rating)
            ? Math.max(0, Math.min(5, data.rating))
            : null
        const reviewCount =
          typeof data.reviewCount === "number" && Number.isFinite(data.reviewCount)
            ? Math.max(0, Math.round(data.reviewCount))
            : null

        if (cancelled) return
        setGoogleRating(rating)
        setGoogleReviewCount(reviewCount)
      } catch {
        // Keep local fallback values.
      }
    }

    loadGoogleSummary()

    return () => {
      cancelled = true
    }
  }, [])

  const displayedRating = googleRating ?? 4.9
  const displayedReviewCount = googleReviewCount ?? 1200

  const stats = [
    { label: "Years Experience", value: "10+" },
    { label: "Average Rating", value: `${displayedRating.toFixed(1)}/5` },
    {
      label: "Google Reviews",
      value: `${displayedReviewCount.toLocaleString()}${googleReviewCount === null ? "+" : ""}`,
    },
  ]

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#f8fafc] py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(60,176,67,0.15),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(60,176,67,0.12),transparent_45%)]" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#3CB043]/12 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#3CB043]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-12 items-start lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
          <div
            ref={leftRef}
            className={`transition-all duration-700 ${
              leftVisible
                ? "translate-y-0 opacity-100 blur-0"
                : "translate-y-8 opacity-0 blur-sm"
            }`}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#3CB043]/10 px-4 py-1.5 text-sm font-semibold text-[#3CB043]">
              Why Choose Phone Garage
            </span>

            <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
              Precision Repairs with <span className="text-[#3CB043]">Human Care</span>
            </h2>

            <p className="mb-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
              We keep your day moving with fast diagnostics, crystal-clear
              pricing, and repairs that feel brand new. Every device is treated
              like our own.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl border border-[#e3e8f0] bg-white/90 p-4 shadow-sm transition-all duration-700 ${
                    leftVisible
                      ? "translate-y-0 opacity-100 blur-0"
                      : "translate-y-6 opacity-0 blur-sm"
                  }`}
                  style={{
                    transitionDelay: leftVisible ? `${120 + index * 90}ms` : "0ms",
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`group flex items-start gap-4 rounded-2xl border border-transparent bg-white/80 p-4 shadow-sm transition-all duration-700 hover:-translate-y-1 hover:border-[#3CB043]/30 hover:bg-white ${
                    leftVisible
                      ? "translate-y-0 opacity-100 blur-0"
                      : "translate-y-6 opacity-0 blur-sm"
                  }`}
                  style={{
                    transitionDelay: leftVisible
                      ? `${260 + index * 120}ms`
                      : "0ms",
                  }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3CB043]/12 text-[#3CB043]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={rightRef}
            className={`transition-all duration-700 delay-150 ${
              rightVisible
                ? "translate-y-0 opacity-100 blur-0"
                : "translate-y-8 opacity-0 blur-sm"
            }`}
          >
            <div className="flex h-full flex-col gap-8">
              <div className="relative h-full">
                <div className="absolute -left-6 -top-6 h-full w-full rounded-[32px] border border-[#e9eef3] bg-white/70" />
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-[32px] border border-[#e3e8f0] bg-white p-8 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.35)] sm:p-10 lg:p-12 ${
                    rightVisible
                      ? "animate-[drop-in_0.7s_ease-out_forwards]"
                      : "translate-y-4 opacity-0"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0">
                    <div
                      className="absolute -inset-10 rounded-[40px] bg-[radial-gradient(circle_at_15%_20%,rgba(60,176,67,0.22),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,0.18),transparent_60%)] opacity-60 blur-2xl"
                      style={{ animation: "card-glow 6s ease-in-out infinite" }}
                    />
                    <div
                      className="absolute -top-12 left-0 h-24 w-[160%] -translate-x-1/4 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.6),transparent)] opacity-40 blur-sm"
                      style={{ animation: "screen-sheen 8s ease-in-out infinite" }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-2xl font-semibold text-card-foreground">
                      <span
                        className={`relative inline-block ${
                          rightVisible
                            ? "animate-[guarantee-title_0.9s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                            : "translate-y-2 opacity-0"
                        }`}
                        style={{
                          animationDelay: rightVisible ? "80ms" : "0ms",
                        }}
                      >
                        Our Guarantee to You
                        <span
                          className={`pointer-events-none absolute -bottom-1.5 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-[#3CB043] via-[#22c55e] to-transparent ${
                            rightVisible
                              ? "animate-[guarantee-underline_0.9s_ease-out_forwards]"
                              : "scale-x-0 opacity-0"
                          }`}
                          style={{
                            animationDelay: rightVisible ? "220ms" : "0ms",
                          }}
                        />
                      </span>
                    </h3>
                    <span className="rounded-full bg-[#3CB043]/10 px-3 py-1 text-xs font-semibold text-[#3CB043]">
                      No fix, no fee
                    </span>
                  </div>
                  <p className="mt-2 text-base text-muted-foreground">
                    A simple promise for every repair.
                  </p>

                  <div className="mt-6 grid gap-3">
                    {guarantees.map((item, index) => (
                      <div
                        key={item.text}
                        className={`flex items-center gap-3 rounded-xl border border-[#e8edf3] bg-[#f8fafb] p-4 text-sm text-foreground transition-transform duration-300 hover:-translate-y-1 hover:shadow-md ${
                          rightVisible
                            ? "animate-[drop-bounce_0.7s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                            : "translate-y-6 opacity-0"
                        }`}
                        style={{
                          animationDelay: rightVisible
                            ? `${240 + index * 110}ms`
                            : "0ms",
                        }}
                      >
                        <item.icon className="h-5 w-5 text-[#3CB043]" />
                        <span className="font-medium text-foreground">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-[#e6edf2] bg-[#f5f7fb] p-5 lg:mt-auto lg:pt-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3CB043]/15">
                        <Star className="h-5 w-5 text-[#3CB043]" />
                      </div>
                      <div>
                        <div className="text-base font-semibold text-foreground">
                          {displayedRating.toFixed(1)} / 5.0 Rating
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Based on {displayedReviewCount.toLocaleString()}
                          {googleReviewCount === null ? "+" : ""} Google Reviews
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-[#3CB043]" />
                      Same-day repairs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
