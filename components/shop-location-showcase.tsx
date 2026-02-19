"use client"

import { useEffect, useRef, useState } from "react"
import { AtSign, Clock3, MapPin, Phone } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function ShopLocationShowcase() {
  const { ref, isVisible } = useScrollAnimation(0.15)
  const rafIdRef = useRef<number | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const node = ref.current
      if (!node) return

      const rect = node.getBoundingClientRect()
      const viewport = window.innerHeight
      const start = viewport * 0.9
      const end = viewport * 0.2
      const raw = (start - rect.top) / Math.max(start - end, 1)
      const progress = Math.min(Math.max(raw, 0), 1)
      setScrollProgress(progress)
    }

    const onScrollOrResize = () => {
      if (rafIdRef.current !== null) return
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null
        updateScrollProgress()
      })
    }

    updateScrollProgress()
    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize)

    return () => {
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [ref])

  const photoCardStyle = {
    transform: `translate3d(${(0.5 - scrollProgress) * 24}px, ${(1 - scrollProgress) * 14}px, 0) scale(${1 - scrollProgress * 0.03})`,
    opacity: 0.9 + scrollProgress * 0.1,
  }

  const mapCardStyle = {
    transform: `translate3d(0, ${(1 - scrollProgress) * 20}px, 0)`,
    opacity: 0.68 + scrollProgress * 0.32,
  }

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-white py-16 lg:py-20"
    >
      <div
        className={`relative mx-auto w-full max-w-6xl pl-4 pr-2 transition-all duration-700 sm:pr-3 lg:pr-0 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#166534] sm:text-sm">Visit Us</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl text-balance">
            See Our Shop & Find Us Easily
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#475569]">
            Visit our mobile repair shop for all brands, including laptops and tablets.
            We provide quality service and expert repairs.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[40%_2px_60%] lg:items-start lg:gap-8">
          <section
            className="relative will-change-transform"
            style={photoCardStyle}
          >
            <div className="absolute top-0 left-0 hidden h-full w-px bg-gradient-to-b from-[#16a34a] via-[#86efac] to-transparent lg:block" />
            <div className="lg:pl-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf3] px-4 py-2 text-[#166534]">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-semibold uppercase tracking-[0.12em]">Contact Us</span>
              </div>
              <h4 className="mt-4 text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">Lidcombe Repair Shop</h4>

              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#334155]">
                Visit our mobile repair shop for all brands including laptops and tablets.
                We provide quality service and expert repairs.
              </p>

              <div className="mt-7 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f8f2]">
                    <MapPin className="h-4 w-4 text-[#16a34a]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748b]">Location</p>
                    <p className="text-lg font-semibold text-[#0f172a]">27 Church St, Lidcombe, NSW 2141</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f8f2]">
                    <Phone className="h-4 w-4 text-[#16a34a]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748b]">Contact Number</p>
                    <p className="text-lg font-semibold text-[#0f172a]">0403983009</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f8f2]">
                    <AtSign className="h-4 w-4 text-[#16a34a]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748b]">Tiktok</p>
                    <p className="text-lg font-semibold text-[#0f172a]">@phonegarage</p>
                  </div>
                </div>
              </div>

              <div className="mt-9">
                <h5 className="flex items-center gap-2 text-lg font-semibold text-[#0f172a]">
                  <Clock3 className="h-4 w-4 text-[#16a34a]" />
                  Hours
                </h5>
                <div className="mt-4 space-y-3">
                  <p className="flex items-center justify-between gap-4 border-b border-dashed border-[#dbe7dd] pb-2 text-[#334155]">
                    <span>Monday to Friday</span>
                    <span className="font-medium text-[#0f172a]">9AM - 7PM</span>
                  </p>
                  <p className="flex items-center justify-between gap-4 text-[#334155]">
                    <span>Weekend</span>
                    <span className="font-medium text-[#0f172a]">10AM - 5:30PM</span>
                  </p>
                </div>
              </div>

            </div>
          </section>

          <div
            aria-hidden="true"
            className="hidden w-[2px] self-stretch bg-[repeating-linear-gradient(to_bottom,#cbd5e1_0_10px,transparent_10px_20px)] lg:block"
          />
          <div
            aria-hidden="true"
            className="h-[2px] bg-[repeating-linear-gradient(to_right,#cbd5e1_0_10px,transparent_10px_20px)] lg:hidden"
          />

          <section
            className="w-full will-change-transform"
            style={mapCardStyle}
          >
            <div className="mx-auto mb-5 flex max-w-md flex-col items-center text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf3]">
                <MapPin className="h-7 w-7 text-[#16a34a]" strokeWidth={2.25} />
              </div>
            </div>

            <div className="w-full overflow-hidden rounded-2xl">
              <iframe
                title="Lidcombe Phone Garage location map"
                src="https://maps.google.com/maps?q=27%20Church%20St%2C%20Lidcombe%2C%20NSW%202141&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="h-[420px] w-full border-0 sm:h-[500px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
