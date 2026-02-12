"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AnimatedSection } from "../animated-section"
import { BookingModule } from "../booking-module"
import { Shield, Clock, Award, Phone, Mail, MapPin, CheckCircle } from "lucide-react"

const benefits = [
  { icon: Clock, text: "Same-day repairs available" },
  { icon: Shield, text: "12-month warranty on all repairs" },
  { icon: Award, text: "Premium quality parts guaranteed" },
]

function BookRepairContent() {
  const searchParams = useSearchParams()

  const brand = searchParams.get("brand") || undefined
  const model = searchParams.get("model") || undefined
  const serviceId = searchParams.get("serviceId") || undefined
  const serviceName = searchParams.get("serviceName") || undefined
  const brandName = searchParams.get("brandName") || undefined
  const modelName = searchParams.get("modelName") || undefined
  const cost = searchParams.get("cost") || undefined
  const time = searchParams.get("time") || undefined

  const hasPreselection = !!(brand && model && serviceName)

  return (
    <div>
      {/* Hero strip */}
      <section className="border-b border-border py-8 lg:py-14">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {hasPreselection ? "Complete Your Booking" : "Book a Repair"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              {hasPreselection
                ? "Your repair details are ready. Pick a store and enter your details to confirm."
                : "Select your service and device — most repairs are done same-day with a 12-month warranty."
              }
            </p>
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <div className="mt-5 flex flex-col items-center gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <b.icon className="h-4 w-4 text-primary shrink-0" />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main content — booking module centred */}
      <section className="py-8 lg:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            {/* Booking module — takes the lead */}
            <div className="flex-1 min-w-0">
              <AnimatedSection>
                <BookingModule
                  preselectedBrand={brand}
                  preselectedModel={model}
                  preselectedService={serviceId}
                  preselectedBrandName={brandName}
                  preselectedModelName={modelName}
                  preselectedServiceName={serviceName}
                  preselectedCost={cost}
                  preselectedTime={time}
                />
              </AnimatedSection>
            </div>

            {/* Sidebar — help & trust */}
            <div className="w-full lg:w-[280px] lg:shrink-0">
              <AnimatedSection delay={120}>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">How it works</h3>
                  <div className="mt-4 space-y-4">
                    {[
                      { step: "1", text: "Select your service and device" },
                      { step: "2", text: "Choose a convenient store" },
                      { step: "3", text: "Enter your details to confirm" },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {item.step}
                        </div>
                        <p className="text-sm text-muted-foreground pt-0.5">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={180}>
                <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">Need help?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Our team is ready to assist you.</p>
                  <div className="mt-4 flex flex-col gap-3">
                    <a href="tel:0297451234" className="flex items-center gap-2.5 rounded-lg py-1 text-[15px] font-medium text-foreground transition-colors active:text-primary hover:text-primary">
                      <Phone className="h-4 w-4 text-primary shrink-0" />(02) 9745 1234
                    </a>
                    <a href="mailto:hello@phonegarage.com.au" className="flex items-center gap-2.5 rounded-lg py-1 text-[15px] font-medium text-foreground transition-colors active:text-primary hover:text-primary">
                      <Mail className="h-4 w-4 text-primary shrink-0" />hello@phonegarage.com.au
                    </a>
                    <a href="/locations" className="flex items-center gap-2.5 rounded-lg py-1 text-[15px] font-medium text-foreground transition-colors active:text-primary hover:text-primary">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />Find a store near you
                    </a>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={240}>
                <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">Why choose us?</h3>
                  <div className="mt-3 space-y-2.5">
                    {[
                      "Certified technicians",
                      "OEM-quality parts",
                      "Free diagnostic assessment",
                      "No fix, no fee guarantee",
                      "4 convenient locations",
                    ].map((text) => (
                      <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export function BookRepairPage() {
  return (
    <Suspense fallback={
      <div className="py-12 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="h-96 animate-pulse rounded-2xl bg-secondary/50" />
        </div>
      </div>
    }>
      <BookRepairContent />
    </Suspense>
  )
}
