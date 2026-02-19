"use client"

import { ArrowRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function CTABanner() {
  const { ref, isVisible } = useScrollAnimation(0.2)

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#0a0a0a] py-16 lg:py-20"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-[#3CB043]/8 blur-[150px]" />

      <div
        className={`relative mx-auto max-w-4xl px-4 text-center transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h2 className="mb-4 text-3xl font-bold text-[#f8f9fa] sm:text-4xl lg:text-5xl text-balance">
          Ready to Get Your Phone{" "}
          <span className="text-[#3CB043]">Fixed?</span>
        </h2>
        <p className="mb-8 text-lg text-[#9ca3af] leading-relaxed">
          Walk in for a free diagnosis or get an instant quote online. Most
          repairs are completed the same day.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="bg-[#000000] text-[#ffffff] hover:bg-[#111111] px-8 py-6 text-base font-semibold shadow-lg shadow-[rgba(60,176,67,0.36)] transition-all hover:shadow-lg hover:shadow-[rgba(21,33,21,0.48)] hover:-translate-y-0.5 active:translate-y-0"
            asChild
          >
            <a href="#contact">
              Get a Free Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-[#333] bg-transparent text-[#f8f9fa] hover:bg-[#1a1a1a] hover:text-[#f8f9fa] px-8 py-6 text-base font-semibold"
            asChild
          >
            <a href="tel:+61212345678">
              <Phone className="mr-2 h-5 w-5" />
              Call Us Now
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
