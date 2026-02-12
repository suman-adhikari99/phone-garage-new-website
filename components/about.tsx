"use client"

import { CheckCircle2, Wrench, Star, Users } from "lucide-react"
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
  const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation()

  return (
    <section id="about" className="relative bg-secondary/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:gap-20">
          {/* Left side */}
          <div
            ref={leftRef}
            className={`flex-1 transition-all duration-700 ${
              leftVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-12 opacity-0"
            }`}
          >
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Why Phone Garage?
            </span>

            <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
              Your Trusted Mobile{" "}
              <span className="text-primary">Repair Experts</span>
            </h2>

            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
              At Phone Garage, we know how essential your phone is to your daily
              life. Our skilled technicians are committed to fast, reliable, and
              affordable repairs that get you back to what matters most.
            </p>

            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`transition-all duration-500 ${
                    leftVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{
                    transitionDelay: leftVisible
                      ? `${300 + index * 150}ms`
                      : "0ms",
                  }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Guarantees */}
          <div
            ref={rightRef}
            className={`flex-1 transition-all duration-700 delay-200 ${
              rightVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-12 opacity-0"
            }`}
          >
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm lg:p-10">
              <h3 className="mb-6 text-xl font-bold text-card-foreground">
                Our Guarantee to You
              </h3>

              <div className="flex flex-col gap-4">
                {guarantees.map((item, index) => (
                  <div
                    key={item}
                    className={`flex items-center gap-3 transition-all duration-500 ${
                      rightVisible
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: rightVisible
                        ? `${400 + index * 100}ms`
                        : "0ms",
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-card-foreground font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      4.9 / 5.0 Rating
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Based on 1,200+ Google Reviews
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
