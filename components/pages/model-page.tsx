"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatedSection } from "../animated-section"
import { BookingModule } from "../booking-module"
import { FaqSection } from "../home/faq-section"
import { serviceCategories, type Brand, type DeviceCategory, type Model, type Service } from "../../lib/data"
import { ArrowLeft, ChevronRight, Clock, DollarSign, Shield } from "lucide-react"

interface Props {
  brand: Brand
  model: Model
  services: Service[]
}

export function ModelPage({ brand, model, services }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
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
  const brandPageHref = contextQuery ? `/brands/${brand.id}?${contextQuery}` : `/brands/${brand.id}`

  const buildBookHref = (service: Service) => {
    const params = new URLSearchParams({
      brand: brand.id,
      model: model.id,
      serviceId: service.id,
      serviceName: service.name,
      brandName: brand.name,
      modelName: model.name,
      cost: String(service.estimateCost),
      time: service.estimateTime,
    })

    if (serviceCategory) params.set("serviceSlug", serviceCategory.slug)
    if (selectedDevice) params.set("device", selectedDevice)

    return `/book?${params.toString()}`
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(brandPageHref)
  }

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-background-secondary py-12 lg:py-16">
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
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <Link href="/services" className="transition-colors hover:text-foreground">Services</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              {serviceCategory && (
                <>
                  <Link href={`/services/${serviceCategory.slug}`} className="transition-colors hover:text-foreground">
                    {serviceCategory.name}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              <Link href={brandPageHref} className="transition-colors hover:text-foreground">{brand.name}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">{model.name}</span>
            </nav>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {brand.name} {model.name} Repair
            </h1>
            <p className="mt-2 text-muted-foreground">Professional repair services with premium parts and warranty included.</p>
            <div className="mt-6 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  serviceCategory ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                1. Service
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  selectedDevice ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                2. Device{selectedDevice ? ` (${deviceLabelMap[selectedDevice]})` : ""}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">3. Brand</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">4. Model</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">5. Book</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            <div className="flex-1">
              <AnimatedSection>
                <h2 className="text-xl font-bold text-foreground">Available Repairs</h2>
                <p className="mt-1 text-sm text-muted-foreground">All prices are estimates. Final pricing confirmed at the store.</p>
              </AnimatedSection>
              <div className="mt-6 flex flex-col gap-3">
                {services.map((service, i) => (
                  <AnimatedSection key={service.id} delay={i * 50}>
                    <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-card-foreground">{service.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <Link
                          href={buildBookHref(service)}
                          className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                        >
                          Book
                        </Link>
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-secondary-foreground">{service.estimateTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">{`From $${service.estimateCost}`}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-success" />
                          <span className="text-xs text-muted-foreground">Warranty</span>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <AnimatedSection delay={400}>
                <div className="mt-8 rounded-2xl bg-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">No hidden fees</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {"We provide transparent pricing upfront. The estimate shown is what you'll pay. If we find additional issues, we'll always consult you first."}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
            <div className="w-full lg:w-[400px] lg:shrink-0">
              <AnimatedSection direction="right">
                <div className="sticky top-24">
                  <BookingModule preselectedBrand={brand.id} preselectedModel={model.id} compact />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
      <FaqSection />
    </div>
  )
}
