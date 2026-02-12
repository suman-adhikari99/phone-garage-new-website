"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatedSection } from "../animated-section"
import type { Brand, Model } from "../../lib/data"
import { Search, ChevronRight, ArrowRight } from "lucide-react"

interface Props {
  brand: Brand
  models: Model[]
}

export function BrandPage({ brand, models }: Props) {
  const [search, setSearch] = useState("")
  const [yearFilter, setYearFilter] = useState<string | null>(null)

  const years = [...new Set(models.map((m) => m.year))].sort((a, b) => b.localeCompare(a))

  const filtered = models.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase())
    const matchesYear = yearFilter ? m.year === yearFilter : true
    return matchesSearch && matchesYear
  })

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-background-secondary py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedSection>
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href="/services" className="transition-colors hover:text-foreground">Services</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">{brand.name}</span>
            </nav>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-2xl font-bold text-foreground shadow-sm">
                {brand.name[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{brand.name} Repair</h1>
                <p className="mt-1 text-muted-foreground">{brand.modelCount} models available for repair</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={`Search ${brand.name} models...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none sm:w-80"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setYearFilter(null)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!yearFilter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  All
                </button>
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setYearFilter(year)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${yearFilter === year ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((model, i) => (
              <AnimatedSection key={model.id} delay={i * 40}>
                <Link href={`/brands/${brand.id}/${model.id}`} className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-secondary-foreground">
                      {model.name.split(" ").pop()?.[0] || "?"}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-card-foreground">{model.name}</h3>
                      <p className="text-xs text-muted-foreground">{model.year}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </AnimatedSection>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No models found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
