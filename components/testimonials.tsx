"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

type TestimonialItem = {
  name: string
  role: string
  text: string
  rating: number
  date: string
  avatar: string
}

type GoogleReviewPayload = {
  authorName: string
  authorPhotoUrl: string
  rating: number
  text: string
  relativeDate: string
  publishedAt: string
}

type GoogleReviewsApiResponse = {
  placeName: string
  rating: number | null
  reviewCount: number | null
  reviews: GoogleReviewPayload[]
}

const fallbackTestimonials: TestimonialItem[] = [
  {
    name: "Sarah Mitchell",
    role: "iPhone 15 Pro Max",
    text: "Absolutely brilliant service! My cracked screen was replaced in under an hour and looks brand new. The team was professional and transparent about pricing. Highly recommend Phone Garage!",
    rating: 4.9,
    date: "29 Aug, 2017",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "James Chen",
    role: "Samsung Galaxy S24",
    text: "My Samsung had serious water damage and I thought it was done for. The team at Phone Garage recovered everything, including all my photos. Amazing work!",
    rating: 4.9,
    date: "29 Aug, 2017",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Emily Robertson",
    role: "Google Pixel 8",
    text: "Fast, friendly and very affordable. They replaced my battery in 20 minutes while I grabbed a coffee. My phone lasts all day again. Will definitely be back if I ever need anything.",
    rating: 4.9,
    date: "29 Aug, 2017",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
]

function formatReviewDate(relativeDate: string, publishedAt: string) {
  if (relativeDate?.trim()) return relativeDate
  if (!publishedAt) return "Google Review"
  const parsed = new Date(publishedAt)
  if (Number.isNaN(parsed.getTime())) return "Google Review"
  return parsed.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function Testimonials() {
  const { ref: sectionRef, isVisible } = useScrollAnimation()
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(fallbackTestimonials)
  const [googleSummary, setGoogleSummary] = useState<{
    placeName: string
    rating: number | null
    reviewCount: number | null
  }>({
    placeName: "Google Reviews",
    rating: null,
    reviewCount: null,
  })
  const [usingGoogleReviews, setUsingGoogleReviews] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({})
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadGoogleReviews() {
      try {
        const res = await fetch("/api/google-reviews", { cache: "no-store" })
        if (!res.ok) return
        const data: GoogleReviewsApiResponse = await res.json()
        if (!Array.isArray(data.reviews) || data.reviews.length === 0) return

        const mapped = data.reviews.map((review) => {
          const safeRating = Math.min(5, Math.max(1, Number(review.rating) || 5))

          return {
            name: review.authorName || "Google User",
            role: "Verified Google Review",
            text: review.text,
            rating: safeRating,
            date: formatReviewDate(review.relativeDate, review.publishedAt),
            avatar: review.authorPhotoUrl || "",
          }
        })

        if (cancelled) return
        setTestimonials(mapped)
        setFailedAvatars({})
        setGoogleSummary({
          placeName: data.placeName || "Google Reviews",
          rating: data.rating ?? null,
          reviewCount: data.reviewCount ?? null,
        })
        setUsingGoogleReviews(true)
        setActiveIndex(0)
      } catch {
        // Keep fallback testimonials on failure.
      }
    }

    loadGoogleReviews()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (activeIndex >= testimonials.length) {
      setActiveIndex(0)
    }
  }, [activeIndex, testimonials.length])

  const featured = testimonials[activeIndex] ?? testimonials[0]
  const list = useMemo(() => {
    const total = testimonials.length
    if (total === 1) {
      return [
        { ...testimonials[0], index: 0, position: "active" as const },
      ]
    }
    if (total === 2) {
      const otherIndex = activeIndex === 0 ? 1 : 0
      return [
        { ...testimonials[activeIndex], index: activeIndex, position: "active" as const },
        { ...testimonials[otherIndex], index: otherIndex, position: "next" as const },
      ]
    }
    const prevIndex = (activeIndex - 1 + total) % total
    const nextIndex = (activeIndex + 1) % total
    return [
      { ...testimonials[prevIndex], index: prevIndex, position: "prev" as const },
      { ...testimonials[activeIndex], index: activeIndex, position: "active" as const },
      { ...testimonials[nextIndex], index: nextIndex, position: "next" as const },
    ]
  }, [activeIndex, testimonials])
  const positions = [
    "md:top-[12px] md:translate-x-1",
    "md:top-[92px] md:translate-x-6",
    "md:top-[172px] md:translate-x-2",
  ]

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
    if (testimonials.length <= 1) return
    const interval = setInterval(() => {
      triggerTransition((prev) => (prev + 1) % testimonials.length)
    }, 5200)

    return () => {
      clearInterval(interval)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [triggerTransition, testimonials.length])

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-[#f4f6fb] py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#f4f6fb_0%,#eef1f6_100%)]" />
        <div className="absolute -left-32 top-0 h-full w-[42%] rounded-r-[220px] bg-gradient-to-b from-[#1f8f45] via-[#23934a] to-[#2fa355]" />
        <div className="absolute left-[42%] top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f8f45]/25 blur-2xl" />
        <svg
          className="absolute -top-8 left-0 h-28 w-full sm:h-32 lg:h-36"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="testimonialWaveTop" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1f8f45" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#2fa355" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#2fa355" stopOpacity="0.22" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 C220,120 480,150 720,110 C960,70 1200,10 1440,36 L1440,0 L0,0 Z"
            fill="url(#testimonialWaveTop)"
          />
        </svg>
        <svg
          className="absolute left-0 top-[55%] h-20 w-full -translate-y-1/2 opacity-70"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="testimonialRibbon"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#1f8f45" stopOpacity="0.1" />
              <stop offset="55%" stopColor="#2fa355" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2fa355" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <path
            d="M0,70 C240,10 520,10 760,60 C1000,110 1240,120 1440,80"
            stroke="url(#testimonialRibbon)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity="0.35"
          />
          <path
            d="M0,70 C240,10 520,10 760,60 C1000,110 1240,120 1440,80"
            stroke="url(#testimonialRibbon)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 h-28 w-full sm:h-32 lg:h-40"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="testimonialWaveBottom"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#1f8f45" stopOpacity="0.16" />
              <stop offset="60%" stopColor="#2fa355" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2fa355" stopOpacity="0.28" />
            </linearGradient>
          </defs>
          <path
            d="M0,96 C240,168 520,170 760,124 C1000,78 1240,0 1440,24 L1440,180 L0,180 Z"
            fill="url(#testimonialWaveBottom)"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          ref={sectionRef}
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f9f53]">
              Business-ready, customer-first
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Transparent quotes. Fast turnaround. Warranty-backed parts.
            </h2>
            <p className="mt-3 text-base text-slate-600">
              We keep your team productive with honest pricing, same-day repairs
              where possible, and service you can trust.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-[18px] border border-[#e3e8f0] bg-white p-8 shadow-[0_35px_90px_-50px_rgba(15,23,42,0.35)] md:p-12 lg:p-16">
            <div className="mb-10">
              <span className="block h-[3px] w-9 rounded-full bg-[#2f9f53]" />
              <p className="mt-4 text-sm font-semibold text-slate-700">
                {usingGoogleReviews ? "Live Google Reviews" : "Customer Reviews"}
              </p>
              {usingGoogleReviews && googleSummary.rating !== null && googleSummary.reviewCount !== null && (
                <p className="mt-1 text-xs text-slate-500">
                  {googleSummary.placeName} • {googleSummary.rating.toFixed(1)} from {googleSummary.reviewCount.toLocaleString()} reviews
                </p>
              )}
            </div>

            <div className="relative grid gap-10 md:grid-cols-[1fr_1.25fr] md:items-stretch">
              <svg
                className="pointer-events-none absolute left-[50%] top-10 hidden h-[260px] w-24 -translate-x-1/2 md:block"
                viewBox="0 0 96 260"
                fill="none"
              >
                <path
                  d="M68 4 C28 52, 28 102, 68 150 C108 198, 108 238, 68 256"
                  stroke="#e6edf4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div className="relative h-full">
                <svg
                  className="absolute left-3 top-2 hidden h-[250px] w-16 md:block"
                  viewBox="0 0 80 240"
                  fill="none"
                >
                  <path
                    d="M62 6 C22 42, 22 78, 62 116 C100 154, 100 194, 62 232"
                    stroke="#dbe4f0"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="relative space-y-8 md:h-[240px] md:space-y-0 md:pl-12">
                  {list.map((testimonial, index) => {
                    const isActive = testimonial.position === "active"
                    const avatarKey = `${testimonial.name}-${testimonial.index}`
                    const showAvatarImage = Boolean(testimonial.avatar?.trim()) && !failedAvatars[avatarKey]
                    const fallbackLetter = (testimonial.name?.trim().charAt(0) || "G").toUpperCase()
                    return (
                    <div
                      key={`${testimonial.name}-${testimonial.index}`}
                      className={`flex items-start gap-4 transition-all duration-500 md:absolute md:w-full ${
                        positions[index] ?? ""
                      } ${isActive ? "opacity-100" : "opacity-60"}`}
                    >
                      <div className="relative">
                        <div
                          className={`flex items-center justify-center overflow-hidden rounded-full border bg-white shadow-sm transition-all duration-300 ${
                            isActive
                              ? "h-11 w-11 border-[#2f9f53]"
                              : "h-10 w-10 border-[#e1e7f0]"
                          }`}
                        >
                          {showAvatarImage ? (
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              onError={() =>
                                setFailedAvatars((prev) => ({
                                  ...prev,
                                  [avatarKey]: true,
                                }))
                              }
                              className={`h-full w-full object-cover ${
                                isActive ? "" : "grayscale"
                              }`}
                            />
                          ) : (
                            <span className={`text-sm font-bold ${
                              isActive ? "text-[#2f9f53]" : "text-slate-500"
                            }`}>
                              {fallbackLetter}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">
                          {testimonial.name}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          <Star className="h-3.5 w-3.5 fill-[#2f9f53] text-[#2f9f53]" />
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

              <div className="relative flex h-full flex-col items-center justify-center text-center md:pl-6">
                <p
                  className={`max-w-md line-clamp-5 text-[18px] font-serif italic leading-relaxed text-slate-600 transition-all duration-500 md:text-[22px] ${
                    isTransitioning
                      ? "opacity-0 translate-y-2"
                      : "opacity-100 translate-y-0"
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
                          (prev - 1 + testimonials.length) % testimonials.length
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
