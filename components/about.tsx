"use client"

import { CheckCircle2, Star, Users, Wrench } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

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
  "Free diagnostic on all devices",
  "No fix, no fee guarantee",
  "Same-day repairs for most issues",
  "6-month warranty on all repairs",
  "Genuine & premium quality parts",
  "Data safety and privacy assured",
]

export function About() {
  const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation()
  const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation(0.08)

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#f7f8fb] py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-y-0 left-0 w-[45%] bg-[#1f8f45]" />
        <div className="absolute left-[45%] top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f8f45]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.9),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(60,176,67,0.1),transparent_55%)]" />
        <div className="absolute right-0 top-0 h-56 w-56 bg-white/70 blur-2xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div
            ref={leftRef}
            className={`transition-all duration-700 ${
              leftVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white">
              Why Phone Garage?
            </span>

            <h2 className="mb-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
              Your Trusted Mobile <span className="text-white">Repair Experts</span>
            </h2>

            <p className="mb-8 max-w-xl text-lg text-white/80 leading-relaxed">
              At Phone Garage, we know how essential your phone is to your daily
              life. Our skilled technicians are committed to fast, reliable, and
              affordable repairs that get you back to what matters most.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`group rounded-2xl border border-[#e3e8f0] bg-white/90 p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md ${
                    leftVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{
                    transitionDelay: leftVisible
                      ? `${150 + index * 120}ms`
                      : "0ms",
                  }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3CB043]/12 text-[#3CB043]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/90 px-4 py-2 text-xs font-semibold text-foreground shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3CB043]/15 text-[#3CB043]">
                  10+
                </span>
                Years combined experience
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/90 px-4 py-2 text-xs font-semibold text-foreground shadow-sm">
                <Star className="h-4 w-4 text-[#3CB043]" />
                4.9 rating on Google
              </div>
            </div>
          </div>

          <div
            ref={rightRef}
            className={`transition-all duration-700 delay-150 ${
              rightVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative rounded-3xl border border-[#e3e8f0] bg-white p-10 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.35)]">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#3CB043]/10 blur-2xl" />
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold text-card-foreground">
                  Our Guarantee to You
                </h3>
                <span className="rounded-full bg-[#3CB043]/10 px-3 py-1 text-xs font-semibold text-[#3CB043]">
                  No fix, no fee
                </span>
              </div>
              <p className="mt-2 text-base text-muted-foreground">
                What you can expect every visit.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {guarantees.map((item, index) => (
                  <div
                    key={item}
                    className={`flex items-center gap-3 rounded-xl border border-[#e8edf3] bg-[#f8fafb] p-4 text-base text-foreground transition-all duration-500 ${
                      rightVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0"
                    }`}
                    style={{
                      transitionDelay: rightVisible
                        ? `${200 + index * 80}ms`
                        : "0ms",
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#3CB043]" />
                    <span className="text-sm font-medium text-foreground">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-[#e6edf2] bg-[#f5f7fb] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3CB043]/15">
                    <Star className="h-5 w-5 text-[#3CB043]" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-foreground">
                      4.9 / 5.0 Rating
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on 1,200+ Google Reviews
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
    </section>
  )
}
