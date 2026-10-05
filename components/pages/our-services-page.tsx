"use client"

import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone, Star } from "lucide-react"
import { getCachedGoogleReviews } from "@/lib/google-reviews-client"
import {
  getRepairServiceHref,
  getRepairServiceQuoteHref,
  repairServices,
  type RepairService,
} from "@/lib/repair-services"

export const EASE = [0.22, 1, 0.36, 1] as const
export const PHONE_NUMBER = "0403983009"
export const SERIF = "[font-family:var(--font-display)] font-normal"

const FALLBACK_RATING = 4.9
const FALLBACK_REVIEW_COUNT = 500

const facts = [
  { value: "10+", suffix: "yrs", label: "At the repair bench" },
  { value: "6", suffix: "mo", label: "Warranty on repairs" },
  { value: "Free", suffix: "", label: "Diagnosis & quotes" },
]

const processSteps = [
  { title: "Walk in", text: "No appointment needed. Drop by Church St or request a quote online." },
  { title: "Diagnose", text: "We find the real fault and give you a clear, upfront price." },
  { title: "Repair", text: "Quality parts, careful hands — most jobs done the same day." },
  { title: "Collect", text: "Pick it up working like new, backed by our six-month warranty." },
]

export function useGoogleRating() {
  const [googleRating, setGoogleRating] = useState<number | null>(null)
  const [googleReviewCount, setGoogleReviewCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadGoogleSummary() {
      try {
        const data = await getCachedGoogleReviews()
        if (!data || cancelled) return
        setGoogleRating(data.rating)
        setGoogleReviewCount(data.reviewCount)
      } catch {
        // Keep local fallback values.
      }
    }

    loadGoogleSummary()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    rating: googleRating ?? FALLBACK_RATING,
    reviewCount: googleReviewCount ?? FALLBACK_REVIEW_COUNT,
    countSuffix: googleReviewCount === null ? "+" : "",
  }
}

export function ReviewCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduceMotion = useReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      setCount(target)
      return
    }
    let raf: number
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / 1800)
      setCount(Math.floor(target * (1 - Math.pow(1 - progress, 3))))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, reduceMotion])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export function FiveStars({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className ?? ""}`} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-[#facc15] text-[#facc15]" />
      ))}
    </span>
  )
}

export function useFooterSpacer() {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const footer = document.getElementById("site-footer")
    const update = () => setHeight(footer ? footer.getBoundingClientRect().height : 0)

    update()
    window.addEventListener("resize", update)
    const observer = footer ? new ResizeObserver(update) : null
    if (footer && observer) observer.observe(footer)

    return () => {
      window.removeEventListener("resize", update)
      observer?.disconnect()
    }
  }, [])

  return height
}

export function RevealLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  const reduceMotion = useReducedMotion()

  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={reduceMotion ? false : { y: "105%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

type RatingSummary = ReturnType<typeof useGoogleRating>

function Hero({ rating }: { rating: RatingSummary }) {
  const reduceMotion = useReducedMotion()
  const heroFacts: { value: string; suffix: React.ReactNode; label: React.ReactNode }[] = [
    {
      value: rating.rating.toFixed(1),
      suffix: <Star className="h-4 w-4 fill-[#facc15] text-[#facc15]" />,
      label: (
        <>
          <ReviewCounter target={rating.reviewCount} suffix={rating.countSuffix} /> Google reviews
        </>
      ),
    },
    ...facts,
  ]
  const bandRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: bandRef, offset: ["start end", "end start"] })
  const imageScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.18, 1])
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-4%", "4%"])

  return (
    <section className="bg-[linear-gradient(180deg,#ffffff_0px,#ffffff_120px,#f5f3ef_460px)] pb-16 pt-36 sm:pt-44 lg:pb-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex items-center gap-3 text-sm font-medium text-zinc-500"
        >
          <span className="h-px w-10 bg-zinc-400" />
          Repair services · Lidcombe, NSW
        </motion.p>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <h1 className="text-[52px] font-semibold leading-[0.96] tracking-[-2px] text-zinc-950 min-[861px]:text-[58px]">
            <RevealLine delay={0.15}>We fix what</RevealLine>
            <RevealLine delay={0.27}>
              others call <span className={`${SERIF} italic tracking-[-0.02em] text-[#1f7a26]`}>unfixable.</span>
            </RevealLine>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
          >
            <p className="max-w-md text-lg leading-relaxed text-zinc-600">
              Phones, laptops, tablets, watches and consoles — repaired by hand on our bench in
              Lidcombe, usually the same day.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="/quote"
                className="group inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#1f7a26]"
              >
                Get a free quote
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#services-index"
                className="inline-flex items-center gap-2 rounded-full px-2 py-3.5 text-sm font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-[6px] transition-colors hover:decoration-zinc-900"
              >
                See what we repair
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          ref={bandRef}
          initial={reduceMotion ? false : { clipPath: "inset(10% 5% 0% 5% round 28px)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 28px)" }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
          className="relative mt-14 overflow-hidden rounded-[28px] bg-zinc-900 lg:mt-20"
        >
          <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
            <motion.img
              src="/images/services/hero-workshop.jpg"
              alt="Technician repairing smartphones at the Phone Garage repair bench"
              width={2400}
              height={1350}
              fetchPriority="high"
              style={{ scale: imageScale, y: imageY }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 border-t border-white/15 text-white lg:grid-cols-4">
            {heroFacts.map((fact, index) => (
              <motion.div
                key={fact.value}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 1 + index * 0.08 }}
                className={`px-5 py-5 sm:px-8 sm:py-6 ${index % 2 === 1 ? "border-l border-white/15" : ""} ${
                  index === 2 ? "border-t border-white/15 lg:border-l lg:border-t-0" : ""
                } ${index === 3 ? "border-t border-white/15 lg:border-t-0" : ""}`}
              >
                <p className="flex items-baseline gap-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {fact.value}
                  <span className="text-base font-medium text-white/60">{fact.suffix}</span>
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-white/60 sm:text-[13px]">
                  {fact.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ServicesIndex() {
  const [active, setActive] = useState(0)
  const activeService = repairServices[active]

  return (
    <section id="services-index" className="scroll-mt-20 bg-[#0d110e] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="max-w-2xl text-[52px] font-semibold leading-[0.96] tracking-[-2px] min-[861px]:text-[58px]"
          >
            Ten things we do <span className={`${SERIF} italic text-primary`}>really</span> well.
          </motion.h2>
          <p className="max-w-sm text-base leading-relaxed text-white/55">
            Pick a service for a closer look at how we bring it back to life.
          </p>
        </div>

        <div className="grid gap-12 pt-4 lg:grid-cols-[1fr_420px] lg:gap-16">
          <ol>
            {repairServices.map((service, index) => (
              <motion.li
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, ease: EASE, delay: index * 0.04 }}
              >
                <a
                  href={getRepairServiceHref(service.slug)}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className="group flex items-center gap-4 border-b border-white/10 py-5 sm:gap-6 lg:py-6"
                >
                  <span
                    className={`w-7 shrink-0 font-mono text-xs transition-colors duration-300 ${
                      active === index ? "text-primary" : "text-white/45"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <img
                    src={service.image}
                    alt=""
                    width={64}
                    height={48}
                    loading="lazy"
                    className="h-12 w-16 shrink-0 rounded-lg object-cover lg:hidden"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-lg font-medium leading-snug tracking-[-0.02em] transition-all duration-500 sm:text-2xl lg:text-[1.75rem] ${
                        active === index ? "text-white lg:translate-x-3" : "text-white/55"
                      }`}
                    >
                      {service.menuLabel}
                    </span>
                    <span className="mt-1 block text-sm text-white/60 lg:hidden">
                      {service.tagline}
                    </span>
                  </span>
                  <span
                    className={`hidden text-lg italic text-white/50 transition-opacity duration-500 xl:block ${SERIF} ${
                      active === index ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {service.tagline}
                  </span>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                      active === index
                        ? "border-primary bg-primary text-white"
                        : "border-white/15 text-white/50"
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              </motion.li>
            ))}
          </ol>

          <div className="relative hidden lg:block">
            <div className="sticky top-28 pt-6">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-zinc-900">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.img
                    key={activeService.slug}
                    src={activeService.image}
                    alt={activeService.title}
                    initial={{ opacity: 0, scale: 1.12 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeService.slug}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        {activeService.badge}
                      </p>
                      <p className={`mt-2 text-3xl leading-tight text-white ${SERIF}`}>
                        {activeService.tagline}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  index,
  total,
  progress,
}: {
  service: RepairService
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const reduceMotion = useReducedMotion()
  const targetScale = 1 - (total - index) * 0.025
  const scale = useTransform(progress, [index / total, 1], [1, reduceMotion ? 1 : targetScale])
  const dark = index % 2 === 1
  const number = String(index + 1).padStart(2, "0")

  return (
    <>
      <div
        id={service.slug}
        className="scroll-mt-28 [@media(min-width:1024px)_and_(min-height:720px)]:scroll-mt-0"
        aria-hidden
      />
      <div
        className="mb-6 [@media(min-width:1024px)_and_(min-height:720px)]:sticky [@media(min-width:1024px)_and_(min-height:720px)]:top-0 [@media(min-width:1024px)_and_(min-height:720px)]:mb-0 [@media(min-width:1024px)_and_(min-height:720px)]:h-svh [@media(min-width:1024px)_and_(min-height:720px)]:pt-[var(--card-offset)]"
        style={{ "--card-offset": `calc(6.5rem + ${index * 8}px)` } as React.CSSProperties}
      >
        <motion.article
          style={{ scale }}
          className={`relative grid w-full origin-top overflow-hidden rounded-[28px] shadow-[0_-20px_60px_-30px_rgba(0,0,0,0.35)] lg:grid-cols-[1.05fr_1fr] [@media(min-width:1024px)_and_(min-height:720px)]:h-[min(600px,calc(100svh-var(--card-offset)-1.5rem))] ${
            dark ? "bg-[#111612] text-white" : "bg-white text-zinc-950 ring-1 ring-black/5"
          }`}
        >
          <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[440px]">
            <motion.img
              src={service.image}
              alt={service.title}
              width={1400}
              height={1050}
              loading="lazy"
              initial={{ scale: 1.15 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.6, ease: EASE }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute left-5 top-5 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              {service.badge}
            </span>
          </div>

          <div className="flex flex-col justify-between gap-8 p-7 sm:p-10 lg:gap-[clamp(1rem,3vh,2rem)] lg:p-[clamp(1.75rem,4.5vh,3rem)]">
            <div>
              <p className={`font-mono text-xs ${dark ? "text-white/55" : "text-zinc-500"}`}>
                {number} / {String(total).padStart(2, "0")}
              </p>
              <h3 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-4xl lg:text-[clamp(1.875rem,4.4vh,2.75rem)]">
                {service.title}
              </h3>
              <p className={`mt-3 text-2xl italic lg:text-[clamp(1.25rem,2.8vh,1.5rem)] ${SERIF} ${dark ? "text-primary" : "text-[#1f7a26]"}`}>
                {service.tagline}
              </p>
              <p className={`mt-5 max-w-md text-base leading-relaxed ${dark ? "text-white/65" : "text-zinc-600"}`}>
                {service.description}
              </p>
            </div>

            <div>
              <ul className={`divide-y text-[15px] ${dark ? "divide-white/10 border-y border-white/10" : "divide-zinc-200 border-y border-zinc-200"}`}>
                {service.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center justify-between py-3 lg:py-[clamp(0.5rem,1.3vh,0.75rem)]">
                    <span className={dark ? "text-white/85" : "text-zinc-800"}>{highlight}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-[clamp(1rem,3vh,1.75rem)]">
                <a
                  href={getRepairServiceQuoteHref(service)}
                  className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-300 ${
                    dark ? "bg-white text-zinc-950 hover:bg-primary hover:text-white" : "bg-zinc-950 text-white hover:bg-[#1f7a26]"
                  }`}
                >
                  Get a free quote
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                {service.page ? (
                  <a
                    href={service.page}
                    className={`group inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                      dark ? "text-white/70 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    Explore {service.title.toLowerCase()}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                      dark ? "text-white/70 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    {PHONE_NUMBER}
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </>
  )
}

function ServiceStack() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  return (
    <section className="bg-[#f5f3ef] pt-24 lg:pt-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 pb-12 lg:grid-cols-2 lg:items-end lg:pb-4">
          <h2 className="text-[52px] font-semibold leading-[0.96] tracking-[-2px] text-zinc-950 min-[861px]:text-[58px]">
            A closer look at <span className={`${SERIF} italic text-[#1f7a26]`}>every</span> repair.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-zinc-600 lg:justify-self-end">
            Genuine-grade parts, honest pricing and a six-month warranty — whichever device lands on
            our bench.
          </p>
        </div>

        <div ref={containerRef} className="pb-16 lg:pb-8">
          {repairServices.map((service, index) => (
            <ServiceCard
              key={service.slug}
              service={service}
              index={index}
              total={repairServices.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section className="bg-[#f5f3ef] pb-24 lg:pb-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="border-t border-zinc-300 pt-14 lg:pt-20">
          <h2 className="max-w-2xl text-[52px] font-semibold leading-[0.96] tracking-[-2px] text-zinc-950 min-[861px]:text-[58px]">
            Four steps, <span className={`${SERIF} italic text-[#1f7a26]`}>zero</span> runaround.
          </h2>

          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {processSteps.map((step, index) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, ease: EASE, delay: index * 0.1 }}
                className="relative pt-6"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-zinc-300" />
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.3 + index * 0.15 }}
                  className="absolute left-0 top-0 h-[2px] w-full origin-left bg-[#1f7a26]"
                />
                <span className={`text-5xl text-zinc-400 ${SERIF}`}>{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-zinc-950">{step.title}</h3>
                <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-zinc-600">{step.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function VisitCta({ rating }: { rating: RatingSummary }) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-8%", "8%"])

  return (
    <section className="bg-[#f5f3ef] px-3 pb-3 sm:px-5 sm:pb-5">
      <div ref={ref} className="relative overflow-hidden rounded-[28px] bg-zinc-950 text-white">
        <motion.img
          src="/images/services/cta-repair.jpg"
          alt=""
          style={{ y: imageY }}
          className="absolute inset-x-0 top-[-10%] h-[120%] w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <h2 className="text-[52px] font-semibold leading-[0.96] tracking-[-2px] min-[861px]:text-[58px]">
              Bring it in.
              <br />
              <span className={`${SERIF} italic text-primary`}>We&apos;ll take it from here.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
              Not sure what&apos;s wrong? We&apos;ll check it for free and tell you exactly what it
              needs — no obligation.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="/quote"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 transition-colors duration-300 hover:bg-primary hover:text-white"
              >
                Get a free quote
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                Call {PHONE_NUMBER}
              </a>
            </div>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
            className="divide-y divide-white/15 border-y border-white/15 text-[15px]"
          >
            <li className="flex items-start gap-4 py-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a
                href="https://www.google.com/maps/search/?api=1&query=27+Church+St+Lidcombe+NSW+2141"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                27 Church St, Lidcombe NSW 2141
                <span className="block text-white/55">Walk-ins welcome · Get directions</span>
              </a>
            </li>
            <li className="flex items-center gap-4 py-4">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <a href="mailto:info@phonegarage.com.au" className="hover:text-primary">
                info@phonegarage.com.au
              </a>
            </li>
            <li className="py-4">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Phone+Garage+27+Church+St+Lidcombe"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4"
              >
                <span className="text-3xl font-semibold tracking-tight">{rating.rating.toFixed(1)}</span>
                <span>
                  <FiveStars />
                  <span className="mt-0.5 block text-white/60 transition-colors group-hover:text-white">
                    from{" "}
                    <span className="font-semibold text-white">
                      <ReviewCounter target={rating.reviewCount} suffix={rating.countSuffix} />
                    </span>{" "}
                    Google reviews
                  </span>
                </span>
              </a>
            </li>
          </motion.ul>
        </div>
      </div>
    </section>
  )
}

export function MobileActionBar({ quoteHref = "/quote" }: { quoteHref?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 640)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "120%" }}
          transition={{ duration: 0.45, ease: EASE }}
          className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-2 rounded-full bg-zinc-950/95 p-1.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:hidden"
        >
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white"
          >
            <Phone className="h-4 w-4" />
            Call us
          </a>
          <a
            href={quoteHref}
            className="flex items-center justify-center gap-2 rounded-full bg-[#1f7a26] py-3 text-sm font-semibold text-white"
          >
            Free quote
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function OurServicesPage() {
  const footerSpacer = useFooterSpacer()
  const rating = useGoogleRating()

  return (
    <>
      <div className="relative z-10 bg-[#f5f3ef]">
        <Hero rating={rating} />
        <ServicesIndex />
        <ServiceStack />
        <Process />
        <VisitCta rating={rating} />
      </div>
      <div aria-hidden className="pointer-events-none" style={{ height: footerSpacer }} />
      <MobileActionBar />
    </>
  )
}
