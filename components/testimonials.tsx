"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "iPhone 15 Pro Max",
    text: "Absolutely brilliant service! My cracked screen was replaced in under an hour and looks brand new. The team was professional and transparent about pricing. Highly recommend Phone Garage!",
    rating: 5,
    date: "29 Aug, 2017",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "James Chen",
    role: "Samsung Galaxy S24",
    text: "My Samsung had serious water damage and I thought it was done for. The team at Phone Garage recovered everything, including all my photos. Amazing work!",
    rating: 5,
    date: "29 Aug, 2017",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Emily Robertson",
    role: "Google Pixel 8",
    text: "Fast, friendly and very affordable. They replaced my battery in 20 minutes while I grabbed a coffee. My phone lasts all day again. Will definitely be back if I ever need anything.",
    rating: 5,
    date: "29 Aug, 2017",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Michael Torres",
    role: "iPhone 14",
    text: "The charging port on my iPhone stopped working. Phone Garage had it fixed same day at a fraction of what Apple quoted me. Fantastic customer service too!",
    rating: 5,
    date: "29 Aug, 2017",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
  },
  {
    name: "Priya Sharma",
    role: "OPPO Find X5",
    text: "I was worried about getting my OPPO repaired since not many places service them. Phone Garage had the parts and fixed my screen perfectly. Great experience overall.",
    rating: 5,
    date: "29 Aug, 2017",
  },
  {
    name: "David O'Connor",
    role: "Samsung Galaxy Z Flip",
    text: "Even my foldable phone wasn't a problem for these guys. The inner screen had a crack and they sorted it out beautifully. Top-notch skill and very reasonable pricing.",
    rating: 5,
    date: "29 Aug, 2017",
  },
]

export function Testimonials() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const featured = testimonials[activeIndex]
  const list = useMemo(() => {
    const total = testimonials.length
    const prevIndex = (activeIndex - 1 + total) % total
    const nextIndex = (activeIndex + 1) % total
    return [
      { ...testimonials[prevIndex], index: prevIndex, position: "prev" },
      { ...testimonials[activeIndex], index: activeIndex, position: "active" },
      { ...testimonials[nextIndex], index: nextIndex, position: "next" },
    ]
  }, [activeIndex])

  const triggerTransition = useCallback(
    (getNextIndex: (prev: number) => number) => {
      setIsTransitioning(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setActiveIndex((prev) => getNextIndex(prev))
        setIsTransitioning(false)
      }, 320)
    },
    []
  )

  useEffect(() => {
    const interval = setInterval(() => {
      triggerTransition(
        (prev) => (prev + 1) % testimonials.length
      )
    }, 5200)

    return () => {
      clearInterval(interval)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [triggerTransition])

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-[#f5f7fb] py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-0 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f8f45]" />
        <div className="absolute right-[-40px] top-10 h-48 w-48 bg-white/40 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:px-8">
        <div
          ref={headerRef}
          className={`transition-all duration-700 ${
            headerVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <div className="relative rounded-[18px] border border-[#e3e8f0] bg-white/95 p-8 shadow-[0_45px_120px_-60px_rgba(15,23,42,0.35)] backdrop-blur md:p-12">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <span className="h-[2px] w-9 rounded-full bg-[#2f9f53]" />
              Customer Reviews
            </div>

            <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1.3fr] md:items-center">
              <div className="relative">
                <svg
                  className="absolute left-3 top-2 hidden h-[240px] w-16 md:block"
                  viewBox="0 0 80 240"
                  fill="none"
                >
                  <path
                    d="M62 6 C22 42, 22 78, 62 116 C100 154, 100 194, 62 232"
                    stroke="#dbe4f0"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M62 6 C22 42, 22 78, 62 116 C100 154, 100 194, 62 232"
                    stroke="#2f9f53"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="6 16"
                    style={{ animation: "testimonial-dash 7s linear infinite" }}
                  />
                </svg>

                <div className="relative space-y-6 md:h-[240px] md:space-y-0 md:pl-12">
                  {list.map((testimonial) => {
                    const isActive = testimonial.position === "active"
                    const positionClass =
                      testimonial.position === "active"
                        ? "md:top-[92px] md:translate-x-6 md:opacity-100 md:scale-100 md:z-10"
                        : testimonial.position === "next"
                          ? "md:top-[168px] md:translate-x-2 md:opacity-60 md:scale-95"
                          : "md:top-[10px] md:translate-x-1 md:opacity-60 md:scale-95"
                    return (
                      <div
                        key={testimonial.index}
                        className={`flex items-start gap-4 transition-all duration-500 ease-out md:absolute md:w-full ${positionClass} ${
                          isActive ? "opacity-100" : "opacity-80"
                        }`}
                      >
                        <div className="relative">
                          <div
                            className={`flex items-center justify-center overflow-hidden rounded-full border bg-white font-semibold shadow-sm transition-all duration-300 ${
                              isActive
                                ? "h-12 w-12 border-[#2f9f53]"
                                : "h-9 w-9 border-[#e1e7f0]"
                            }`}
                          >
                            {testimonial.avatar ? (
                              <img
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span
                                className={`${
                                  isActive
                                    ? "text-sm text-[#2f9f53]"
                                    : "text-[11px] text-slate-500"
                                }`}
                              >
                                {testimonial.name
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")}
                              </span>
                            )}
                          </div>
                          <span
                            className={`absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white bg-[#2f9f53] ${
                              isActive ? "animate-pulse" : ""
                            }`}
                          />
                        </div>
                        <div>
                          <div
                            className={`font-semibold ${
                              isActive
                                ? "text-sm text-slate-700"
                                : "text-xs text-slate-500"
                            }`}
                          >
                            {testimonial.name}
                          </div>
                          <div
                            className={`mt-1 flex items-center gap-2 text-slate-400 ${
                              isActive ? "text-xs" : "text-[11px]"
                            }`}
                          >
                            <Star
                              className={`fill-[#2f9f53] text-[#2f9f53] ${
                                isActive ? "h-3.5 w-3.5" : "h-3 w-3"
                              }`}
                            />
                            <span>
                              {testimonial.rating.toFixed(1)} on {testimonial.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="relative md:pl-6">
                <div className="absolute -right-6 top-0 h-16 w-16 rounded-full bg-[#f0f4f8]" />
                <p
                  className={`text-[20px] font-serif italic leading-relaxed text-slate-600 transition-all duration-500 md:text-[28px] ${
                    isTransitioning
                      ? "opacity-0 translate-y-2 blur-[1px]"
                      : "opacity-100 translate-y-0 blur-0"
                  }`}
                >
                  <span className="mr-3 text-4xl text-[#2f9f53]">&ldquo;</span>
                  {featured.text}
                  <span className="ml-2 text-4xl text-[#2f9f53]">&rdquo;</span>
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Previous testimonial"
                    onClick={() =>
                      triggerTransition(
                        (prev) =>
                          (prev - 1 + testimonials.length) %
                          testimonials.length
                      )
                    }
                    disabled={isTransitioning}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e3e8f0] bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#2f9f53] hover:text-[#2f9f53] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next testimonial"
                    onClick={() =>
                      triggerTransition(
                        (prev) => (prev + 1) % testimonials.length
                      )
                    }
                    disabled={isTransitioning}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e3e8f0] bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#2f9f53] hover:text-[#2f9f53] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
