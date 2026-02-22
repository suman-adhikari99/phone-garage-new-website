"use client"

import { useState } from "react"
import { AnimatedSection } from "../animated-section"
import { faqs } from "../../lib/data"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <AnimatedSection>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
        </AnimatedSection>

        <div className="mt-12 flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i} delay={i * 60}>
              <div className="rounded-xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="pr-4 text-sm font-medium text-card-foreground">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      openIndex === i && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openIndex === i ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
