"use client"

import { MessageSquare, Search, Wrench, CheckCircle2 } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Get a Quote",
    description:
      "Tell us about your device and the issue. Get an instant estimate online or walk into our store.",
  },
  {
    icon: Search,
    step: "02",
    title: "Free Diagnosis",
    description:
      "Our technicians perform a thorough diagnostic to identify the exact problem and confirm the repair cost.",
  },
  {
    icon: Wrench,
    step: "03",
    title: "Expert Repair",
    description:
      "Using premium parts and precision tools, we repair your device with care. Most repairs are completed same day.",
  },
  {
    icon: CheckCircle2,
    step: "04",
    title: "Quality Check & Pickup",
    description:
      "Every device goes through a multi-point inspection before handover. Pick up your device and enjoy the warranty.",
  },
]

export function Process() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollAnimation(0.1)

  return (
    <section className="relative bg-background py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`mb-16 text-center transition-all duration-700 ${
            headerVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Simple <span className="text-primary">4-Step</span> Repair Process
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Getting your phone fixed has never been easier. Follow our
            streamlined process for a hassle-free repair experience.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-16 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] hidden h-0.5 bg-border lg:block">
            <div
              className={`h-full bg-primary transition-all duration-1500 ease-out ${
                stepsVisible ? "w-full" : "w-0"
              }`}
              style={{ transitionDelay: "400ms" }}
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`group relative flex flex-col items-center text-center transition-all duration-700 ${
                  stepsVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{
                  transitionDelay: stepsVisible ? `${index * 200}ms` : "0ms",
                }}
              >
                {/* Step number circle */}
                <div className="relative mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/5 transition-all duration-300 group-hover:border-primary group-hover:bg-primary/10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.step}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
