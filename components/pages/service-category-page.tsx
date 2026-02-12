"use client"

import Link from "next/link"
import { AnimatedSection } from "../animated-section"
import type { ServiceCategory, Brand } from "../../lib/data"
import { ArrowRight, ChevronRight } from "lucide-react"

interface Props {
  category: ServiceCategory
  brands: Brand[]
}

export function ServiceCategoryPage({ category, brands }: Props) {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-background-secondary py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedSection>
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href="/services" className="transition-colors hover:text-foreground">Services</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">{category.name}</span>
            </nav>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{category.name}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {category.description} Select your brand below to see specific pricing and repair times.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedSection>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Select your brand</h2>
          </AnimatedSection>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand, i) => (
              <AnimatedSection key={brand.id} delay={i * 60}>
                <Link href={`/brands/${brand.id}`} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-md">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-secondary-foreground transition-transform duration-200 group-hover:scale-[1.03]">
                    {brand.name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-card-foreground">{brand.name}</h3>
                    <p className="text-xs text-muted-foreground">{brand.modelCount} models</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
