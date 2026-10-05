"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import { ArrowRight, ArrowUpRight, MapPin, Phone, Plus } from "lucide-react"
import {
  EASE,
  FiveStars,
  MobileActionBar,
  PHONE_NUMBER,
  ReviewCounter,
  RevealLine,
  useFooterSpacer,
  useGoogleRating,
} from "@/components/pages/our-services-page"
import { DotField } from "@/components/laptop-repair/dot-field"
import { RepairBuddy } from "@/components/laptop-repair/repair-buddy"
import { laptopRepairFaqs } from "@/lib/laptop-repair-faqs"

const LAPTOP_QUOTE = "/quote?device=laptop"
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Phone+Garage+27+Church+St+Lidcombe"

const laptopQuoteHref = (params: { brand?: string; issue?: string }) => {
  const search = new URLSearchParams({ device: "laptop" })
  if (params.brand) search.set("brand", params.brand)
  if (params.issue) search.set("issue", params.issue)
  return `/quote?${search.toString()}`
}

interface LaptopRepair {
  id: string
  title: string
  text: string
  symptoms: string[]
  issue?: string
}

const laptopRepairs: LaptopRepair[] = [
  {
    id: "screen",
    title: "Screen replacement",
    text: "LCD, OLED and Retina panels replaced and checked for colour, brightness and dead pixels.",
    symptoms: ["Cracked glass", "Lines or flicker", "Black screen"],
    issue: "screen",
  },
  {
    id: "keyboard",
    title: "Keyboard & trackpad",
    text: "Single keys, full keyboards and top cases — plus trackpads that won't click or track.",
    symptoms: ["Sticky keys", "Keys not working", "Jumpy cursor"],
    issue: "keyboard",
  },
  {
    id: "battery",
    title: "Battery replacement",
    text: "Fresh cells for laptops that die early, only run on the charger, or have started to swell.",
    symptoms: ["Drains fast", "Swollen case", "Won't hold charge"],
    issue: "battery",
  },
  {
    id: "charging",
    title: "Charging port & DC jack",
    text: "Loose USB-C ports and worn barrel jacks repaired or replaced so power stays connected.",
    symptoms: ["Not charging", "Loose plug", "Charges at an angle"],
    issue: "charging",
  },
  {
    id: "hinge",
    title: "Hinges & casing",
    text: "Snapped, stiff or wobbly hinges fixed, with cracked lids and corners rebuilt or replaced.",
    symptoms: ["Lid won't stay up", "Cracking noise", "Broken corner"],
    issue: "hinge",
  },
  {
    id: "motherboard",
    title: "No power & board repair",
    text: "Dead laptops diagnosed at chip level — shorts, power faults and no-display issues.",
    symptoms: ["Won't turn on", "No display", "Burning smell"],
    issue: "motherboard",
  },
  {
    id: "water",
    title: "Liquid spills",
    text: "Switch it off and bring it straight in. We open it up, clean the board and stop corrosion.",
    symptoms: ["Coffee or water spill", "Keys stopped working", "Random shutdowns"],
    issue: "water",
  },
  {
    id: "overheating",
    title: "Overheating & fan service",
    text: "Dust cleaned out, fresh thermal paste and new fans for laptops that run hot and loud.",
    symptoms: ["Loud fan", "Hot underneath", "Slows down or shuts off"],
    issue: "overheating",
  },
  {
    id: "upgrades",
    title: "SSD & RAM upgrades",
    text: "Give an older laptop a second life with faster storage and more memory — data moved over.",
    symptoms: ["Slow to start", "Out of storage", "Freezes with many tabs"],
    issue: "other",
  },
  {
    id: "data",
    title: "Data & software",
    text: "Files rescued from failing drives, plus OS reinstalls, virus removal and setup.",
    symptoms: ["Won't boot", "Lost files", "Virus or pop-ups"],
    issue: "data",
  },
]

/** `wide` marks wordmark logos, which need more room to stay legible. */
const laptopBrands: {
  name: string
  short?: string
  logo?: string
  quoteBrand?: string
  wide?: boolean
}[] = [
  {
    name: "Apple MacBook",
    short: "MacBook",
    logo: "/images/brands/apple.svg",
    quoteBrand: "macbook",
  },
  { name: "Dell", logo: "/images/brands/dell.svg", quoteBrand: "dell" },
  { name: "HP", logo: "/images/brands/hp.svg", quoteBrand: "hp" },
  {
    name: "Lenovo",
    logo: "/images/brands/lenovo.svg",
    quoteBrand: "lenovo",
    wide: true,
  },
  {
    name: "ASUS",
    logo: "/images/brands/asus.svg",
    quoteBrand: "asus",
    wide: true,
  },
  {
    name: "Acer",
    logo: "/images/brands/acer.svg",
    quoteBrand: "acer",
    wide: true,
  },
  { name: "MSI", logo: "/images/brands/msi.svg", quoteBrand: "msi" },
  { name: "Microsoft Surface", short: "Surface", quoteBrand: "surface" },
  {
    name: "Samsung Galaxy Book",
    short: "Galaxy Book",
    logo: "/images/brands/samsung.svg",
    quoteBrand: "galaxy-book",
    wide: true,
  },
  { name: "Razer", logo: "/images/brands/razer.svg", quoteBrand: "razer" },
  {
    name: "LG gram",
    logo: "/images/brands/lg.svg",
    quoteBrand: "lg-gram",
    wide: true,
  },
  {
    name: "Alienware",
    logo: "/images/brands/alienware.svg",
    quoteBrand: "alienware",
  },
  {
    name: "Huawei MateBook",
    short: "MateBook",
    logo: "/images/brands/huawei.svg",
    quoteBrand: "huawei-matebook",
  },
  {
    name: "Toshiba / Dynabook",
    short: "Toshiba",
    logo: "/images/brands/toshiba.svg",
    quoteBrand: "toshiba",
    wide: true,
  },
  {
    name: "Chromebook",
    logo: "/images/brands/google.svg",
    quoteBrand: "chromebook",
  },
  { name: "Gigabyte / Aorus", quoteBrand: "gigabyte" },
  { name: "Panasonic", logo: "/images/brands/panasonic.svg", wide: true },
  { name: "Fujitsu", logo: "/images/brands/fujitsu.svg" },
]

const steps = [
  {
    title: "Bring it in",
    text: "Walk in to 27 Church St or send a quote request — no appointment needed.",
    say: "Hi! Just walk in — no appointment needed.",
  },
  {
    title: "Free diagnosis",
    text: "We open it up, find the real fault and explain it in plain English.",
    say: "Let's find the real fault. The check is free.",
  },
  {
    title: "You approve",
    text: "A clear, upfront price. Nothing is repaired until you say yes.",
    say: "Here's your price. We only start when you say yes.",
  },
  {
    title: "Fixed & tested",
    text: "Repaired, tested end to end and backed by a six-month warranty.",
    say: "All fixed and tested — with a 6-month warranty!",
  },
]

const STEP_AUTOPLAY_MS = 4800

const heroDiagnosticPins = [
  { label: "Battery", issue: "battery", x: "45%", y: "35%", side: "left" },
  { label: "Board", issue: "motherboard", x: "67%", y: "36%", side: "right" },
  { label: "Fan", issue: "overheating", x: "72%", y: "68%", side: "right" },
  { label: "SSD", issue: "data", x: "29%", y: "72%", side: "left" },
] as const

type RatingSummary = ReturnType<typeof useGoogleRating>

const AUTOPLAY_MS = 5000
const H2 = "text-balance text-[36px] font-extrabold leading-[1.04] tracking-[-0.03em] sm:text-[46px]"
const ACCENT = ""
const BUTTON_BASE =
  "group inline-flex h-[52px] items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold transition-colors duration-300"

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-sm font-medium ${dark ? "text-white/55" : "text-zinc-500"}`}>
      <span className={`h-px w-10 ${dark ? "bg-white/30" : "bg-zinc-400"}`} />
      {children}
    </p>
  )
}

function Hero({ rating }: { rating: RatingSummary }) {
  const reduceMotion = useReducedMotion()
  const imageRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-3%", "3%"])

  return (
    <section className="relative isolate overflow-hidden bg-[#f7f5ef] pb-14 pt-32 sm:pt-44 lg:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[68%] bg-gradient-to-b from-white via-white/95 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.42] [background-image:linear-gradient(rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.055)_1px,transparent_1px)] [background-size:88px_88px] [mask-image:linear-gradient(180deg,transparent,#000_18%,#000_76%,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-full w-[62%] bg-[linear-gradient(116deg,transparent_0%,rgba(255,255,255,0)_28%,rgba(31,122,38,0.08)_62%,rgba(17,22,18,0.07)_100%)]"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8">
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <Eyebrow>Laptop repair · Lidcombe, NSW</Eyebrow>
          </motion.div>

          <h1 className="mt-7 text-[52px] font-black leading-[0.98] tracking-[-2px] text-zinc-950 min-[861px]:text-[58px]">
            <RevealLine delay={0.15}>Every laptop.</RevealLine>
            <RevealLine delay={0.27}>
              Every <span className={`${ACCENT} text-[#1f7a26]`}>brand.</span>
            </RevealLine>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          >
            <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-zinc-600">
              MacBooks, Windows laptops, gaming rigs and Chromebooks — repaired by hand on our bench in Lidcombe.
            </p>

            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <a href={LAPTOP_QUOTE} className={`${BUTTON_BASE} bg-zinc-950 text-white hover:bg-[#1f7a26]`}>
                Get a free laptop quote
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className={`${BUTTON_BASE} border border-zinc-300 bg-white/60 text-zinc-900 hover:border-zinc-950`}
              >
                <Phone className="h-4 w-4" />
                Call {PHONE_NUMBER}
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 border-t border-zinc-300 pt-6 tabular-nums">
              <div className="pr-3">
                <dt className="sr-only">Google rating</dt>
                <dd>
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="group block">
                    <span className="flex items-center gap-1.5 text-[28px] font-semibold leading-none tracking-[-0.03em] text-zinc-950">
                      {rating.rating.toFixed(1)}
                      <FiveStars className="[&_svg]:h-3 [&_svg]:w-3" />
                    </span>
                    <span className="mt-2 block text-[13px] leading-snug text-zinc-500 transition-colors group-hover:text-zinc-900 sm:text-sm">
                      <ReviewCounter target={rating.reviewCount} suffix={rating.countSuffix} /> Google reviews
                    </span>
                  </a>
                </dd>
              </div>
              <div className="border-l border-zinc-300 px-3 sm:px-5">
                <dt className="sr-only">Diagnosis</dt>
                <dd>
                  <span className="block text-[28px] font-semibold leading-none tracking-[-0.03em] text-zinc-950">
                    Free
                  </span>
                  <span className="mt-2 block text-[13px] leading-snug text-zinc-500 sm:text-sm">
                    Diagnosis & quote
                  </span>
                </dd>
              </div>
              <div className="border-l border-zinc-300 pl-3 sm:pl-5">
                <dt className="sr-only">Warranty</dt>
                <dd>
                  <span className="block text-[28px] font-semibold leading-none tracking-[-0.03em] text-zinc-950">
                    6<span className="ml-0.5 text-lg font-medium text-zinc-500">mo</span>
                  </span>
                  <span className="mt-2 block text-[13px] leading-snug text-zinc-500 sm:text-sm">Repair warranty</span>
                </dd>
              </div>
            </dl>
          </motion.div>
        </div>

        <motion.div
          ref={imageRef}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.15 }}
          className="relative mx-auto aspect-square w-full max-w-[590px] lg:-my-10 lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute left-[8%] right-[2%] top-[13%] h-px bg-gradient-to-r from-transparent via-zinc-950/15 to-transparent"
          />
          <div
            aria-hidden
            className="absolute bottom-[12%] left-[12%] right-[6%] h-[18%] bg-[linear-gradient(180deg,rgba(17,22,18,0.13),rgba(17,22,18,0))] blur-xl [transform:skew(-14deg)_rotate(-5deg)]"
          />
          <motion.div style={{ y: imageY, scale: 1.1 }} className="absolute inset-[-7%]">
            <div
              aria-hidden
              className="absolute inset-[5%] z-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(245,243,239,0.10)_64%)] [clip-path:polygon(20%_2%,100%_22%,83%_96%,0_73%)]"
            />
            <img
              src="/images/services/laptop-hero-light.jpg"
              alt="Opened laptop with its motherboard, battery and cooling fan exposed, next to spare SSDs and a precision screwdriver"
              width={1024}
              height={1024}
              fetchPriority="high"
              className="absolute inset-0 z-10 h-full w-full object-cover opacity-[0.98] drop-shadow-[0_34px_42px_rgba(17,22,18,0.20)] saturate-[1.04] contrast-[1.03]"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 82% 78% at 54% 48%, #000 58%, rgba(0,0,0,0.84) 73%, transparent 91%)",
                maskImage:
                  "radial-gradient(ellipse 82% 78% at 54% 48%, #000 58%, rgba(0,0,0,0.84) 73%, transparent 91%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 z-20 bg-[linear-gradient(125deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_34%,rgba(245,243,239,0.58)_92%)]"
            />
            {heroDiagnosticPins.map((pin, index) => (
              <HeroPin key={pin.label} pin={pin} index={index} reduceMotion={!!reduceMotion} />
            ))}
            <div className="absolute bottom-[9%] right-[7%] z-30 hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-700 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1f7a26]" />
              Precision bench
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function HeroPin({
  pin,
  index,
  reduceMotion,
}: {
  pin: (typeof heroDiagnosticPins)[number]
  index: number
  reduceMotion: boolean
}) {
  return (
    <motion.a
      href={laptopQuoteHref({ issue: pin.issue })}
      aria-label={`Get a quote for ${pin.label.toLowerCase()} repair`}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.62 + index * 0.08 }}
      className="group/pin absolute z-30 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center outline-none"
      style={{ left: pin.x, top: pin.y }}
    >
      <span className="relative grid h-4 w-4 place-items-center rounded-full bg-zinc-950 shadow-[0_8px_24px_rgba(17,22,18,0.22)] ring-[5px] ring-white/80 transition-all duration-300 group-hover/pin:scale-110 group-hover/pin:bg-[#1f7a26] group-focus-visible/pin:scale-110 group-focus-visible/pin:bg-[#1f7a26]">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </span>
    </motion.a>
  )
}

function BrandWall() {
  return (
    <section className="pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Eyebrow>Brands we repair</Eyebrow>
            <h2 className={`mt-5 ${H2} text-zinc-950`}>
              We repair <span className={`${ACCENT} text-[#1f7a26]`}>all</span> brands.
            </h2>
          </div>
          <p className="max-w-xs text-pretty text-base leading-relaxed text-zinc-600">
            Pick your brand to start a quote — it takes about a minute.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-[24px] border border-zinc-200 bg-zinc-200 lg:grid-cols-6">
          {laptopBrands.map((brand, index) => (
            <motion.li
              key={brand.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
              className="bg-white"
            >
              <a
                href={laptopQuoteHref({ brand: brand.quoteBrand })}
                aria-label={`Get a quote for ${brand.name}`}
                className="group relative flex h-[108px] flex-col items-center justify-center gap-2.5 px-2 text-center transition-colors duration-300 hover:bg-[#f5f3ef] sm:h-32 sm:gap-3"
              >
                <span className="flex h-8 items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt=""
                      width={brand.wide ? 72 : 28}
                      height={brand.wide ? 72 : 28}
                      loading="lazy"
                      className={`object-contain opacity-75 transition-opacity duration-300 group-hover:opacity-100 ${
                        brand.wide ? "h-14 w-14 sm:h-[72px] sm:w-[72px]" : "h-6 w-6 sm:h-7 sm:w-7"
                      }`}
                    />
                  ) : (
                    <span className="text-[15px] font-semibold tracking-[-0.02em] text-zinc-700 group-hover:text-zinc-950 sm:text-base">
                      {brand.name.split(" ")[0]}
                    </span>
                  )}
                </span>
                <span className="text-[13px] font-medium leading-tight text-zinc-500 group-hover:text-zinc-950 sm:text-sm">
                  <span className="sm:hidden">{brand.short ?? brand.name}</span>
                  <span className="hidden sm:inline">{brand.name}</span>
                </span>
                <ArrowUpRight className="absolute right-2.5 top-2.5 h-4 w-4 text-[#1f7a26] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </a>
            </motion.li>
          ))}
        </ul>

        <p className="mt-6 text-[15px] text-zinc-600">
          Don&apos;t see your brand?{" "}
          <a
            href={LAPTOP_QUOTE}
            className="font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-[5px] transition-colors hover:decoration-zinc-950"
          >
            We fix it too — get a quote
          </a>
        </p>
      </div>
    </section>
  )
}

const SPOTS: Record<string, { x: number; y: number }> = {
  screen: { x: 41, y: 18 },
  keyboard: { x: 46, y: 38 },
  battery: { x: 46, y: 71 },
  charging: { x: 34, y: 89.5 },
  hinge: { x: 33, y: 32.5 },
  motherboard: { x: 34, y: 52.5 },
  water: { x: 32, y: 43.5 },
  overheating: { x: 56.5, y: 51.5 },
  upgrades: { x: 38, y: 57.5 },
  data: { x: 82, y: 56.5 },
}

const ORBIT_RADIUS = 62

const orbitPoint = (degrees: number, radius = ORBIT_RADIUS) => {
  const angle = (degrees * Math.PI) / 180
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) }
}

const orbitArrow = (from: number, to: number) => {
  const start = orbitPoint(from)
  const end = orbitPoint(to)
  const angle = (to * Math.PI) / 180
  const tangent = { x: -Math.sin(angle), y: Math.cos(angle) }
  const head = (turn: number) => {
    const cos = Math.cos(turn)
    const sin = Math.sin(turn)
    return {
      x: end.x + (tangent.x * cos - tangent.y * sin) * 9,
      y: end.y + (tangent.x * sin + tangent.y * cos) * 9,
    }
  }
  const left = head((150 * Math.PI) / 180)
  const right = head((-150 * Math.PI) / 180)
  const f = (n: number) => n.toFixed(2)
  return `M ${f(start.x)} ${f(start.y)} A ${ORBIT_RADIUS} ${ORBIT_RADIUS} 0 0 1 ${f(end.x)} ${f(end.y)} M ${f(left.x)} ${f(left.y)} L ${f(end.x)} ${f(end.y)} L ${f(right.x)} ${f(right.y)}`
}

const RECOVERY_ARROWS = [orbitArrow(-150, -40), orbitArrow(30, 140)]

function RecoveryArrows({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="-75 -110 150 220"
      className="pointer-events-none absolute"
      style={{ left: "76.5%", top: "45.75%", width: "13%", height: "25.5%" }}
    >
      <g transform="scale(1 1.58)">
        <g
          className={`animate-[spin_9s_linear_infinite] [transform-box:fill-box] [transform-origin:center] motion-reduce:animate-none ${
            active ? "" : "[animation-play-state:paused] group-hover/sketch:[animation-play-state:running]"
          }`}
        >
          {RECOVERY_ARROWS.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={active ? "#4ade80" : "#a5d36a"}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ transition: "stroke 300ms" }}
            />
          ))}
        </g>
      </g>
    </svg>
  )
}

type CalloutSide = "left" | "right" | "bottom"

const CALLOUT_ARROWS = {
  right: {
    viewBox: "0 0 26 12",
    tick: "M 24 1.5 L 24 10.5",
    shaft: "M 24 6 L 2 6",
    head: "M 7.5 1.5 L 2 6 L 7.5 10.5",
  },
  left: {
    viewBox: "0 0 26 12",
    tick: "M 2 1.5 L 2 10.5",
    shaft: "M 2 6 L 24 6",
    head: "M 18.5 1.5 L 24 6 L 18.5 10.5",
  },
  bottom: {
    viewBox: "0 0 12 18",
    tick: "M 1.5 16.5 L 10.5 16.5",
    shaft: "M 6 16.5 L 6 2",
    head: "M 1.5 7 L 6 2 L 10.5 7",
  },
} as const

function Callout({ side, title, style }: { side: CalloutSide; title: string; style: React.CSSProperties }) {
  const reduceMotion = useReducedMotion()
  const arrow = CALLOUT_ARROWS[side]
  const toward = side === "right" ? { x: -4 } : side === "left" ? { x: 4 } : { y: -3 }
  const draw = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: 0.3, ease: EASE, delay },
        }

  return (
    <div aria-hidden className="pointer-events-none absolute z-10 hidden sm:block" style={style}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 20, delay: 0.08 }}
        className="relative"
        style={{
          transformOrigin:
            side === "right" ? "left center" : side === "left" ? "right center" : "calc(100% - 14px) top",
        }}
      >
        <span
          className={`absolute h-2.5 w-2.5 rotate-45 rounded-[2px] bg-white ${
            side === "right"
              ? "-left-1 top-1/2 -translate-y-1/2"
              : side === "left"
                ? "-right-1 top-1/2 -translate-y-1/2"
                : "-top-1 right-[9px]"
          }`}
        />
        <span
          className={`relative flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-white py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-black shadow-[0_10px_30px_-6px_rgba(0,0,0,0.6)] ${
            side === "left"
              ? "flex-row-reverse pl-3 pr-2.5"
              : side === "bottom"
                ? "flex-row-reverse pl-3 pr-2"
                : "pl-2.5 pr-3"
          }`}
        >
          <motion.svg
            viewBox={arrow.viewBox}
            className={side === "bottom" ? "h-[18px] w-3 shrink-0" : "h-3 w-[26px] shrink-0"}
            fill="none"
            stroke="#000"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={reduceMotion ? undefined : { x: [0, toward.x ?? 0, 0], y: [0, toward.y ?? 0, 0] }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: 0.75, repeat: 3, repeatDelay: 0.9 }}
          >
            <motion.path d={arrow.tick} {...draw(0.2)} />
            <motion.path d={arrow.shaft} {...draw(0.3)} />
            <motion.path d={arrow.head} {...draw(0.55)} />
          </motion.svg>
          {title}
          {!reduceMotion && (
            <motion.span
              className="absolute inset-y-0 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-black/10 to-transparent"
              initial={{ left: "-30%" }}
              animate={{ left: "130%" }}
              transition={{ duration: 0.8, ease: "easeInOut", delay: 0.45 }}
            />
          )}
        </span>
      </motion.div>
    </div>
  )
}

function LaptopRender({
  active,
  previewId,
  onSelect,
}: {
  active: LaptopRepair
  previewId: string | null
  onSelect: (id: string) => void
}) {
  const reduceMotion = useReducedMotion()
  const tiltX = useSpring(0, { stiffness: 120, damping: 18 })
  const tiltY = useSpring(0, { stiffness: 120, damping: 18 })
  const rotateX = useTransform(tiltY, (v) => `${v * -7}deg`)
  const rotateY = useTransform(tiltX, (v) => `${v * 9}deg`)
  const spot = SPOTS[active.id] ?? SPOTS.screen
  const labelSide: CalloutSide = spot.x > 70 ? "bottom" : spot.x > 60 ? "left" : "right"
  const labelPosition: React.CSSProperties =
    labelSide === "bottom"
      ? {
          right: `calc(${100 - spot.x}% - 14px)`,
          top: `calc(${spot.y}% + 24px)`,
          transform: "translateZ(70px)",
        }
      : labelSide === "left"
        ? { top: `${spot.y}%`, right: `calc(${100 - spot.x}% + 22px)`, transform: "translateY(-50%) translateZ(70px)" }
        : { top: `${spot.y}%`, left: `calc(${spot.x}% + 22px)`, transform: "translateY(-50%) translateZ(70px)" }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return
    const rect = event.currentTarget.getBoundingClientRect()
    tiltX.set((event.clientX - rect.left) / rect.width - 0.5)
    tiltY.set((event.clientY - rect.top) / rect.height - 0.5)
  }
  const reset = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  return (
    <div
      className="group/sketch relative overflow-hidden [perspective:1400px]"
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      <motion.div className="relative aspect-[4/3] [transform-style:preserve-3d]" style={{ rotateX, rotateY }}>
        <div className="absolute left-1/2 top-1/2 aspect-[4/3] w-[106%] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]">
          <img
            src="/images/services/laptop-sketch-v3.jpg"
            alt={`Sketch of a laptop taken apart, highlighting the ${active.title.toLowerCase()} area`}
            width={1152}
            height={864}
            className="absolute inset-0 h-full w-full select-none"
            draggable={false}
          />
          <RecoveryArrows active={active.id === "data"} />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_closest-side,rgba(74,222,128,0.3)_0%,rgba(74,222,128,0.08)_50%,transparent_100%)] mix-blend-screen"
            animate={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ transform: "translateZ(20px)" }}
          />

          <Callout key={active.id} side={labelSide} title={active.title} style={labelPosition} />

          {laptopRepairs.map((repair, index) => {
            const point = SPOTS[repair.id]
            const isActive = repair.id === active.id
            const isPreview = !isActive && repair.id === previewId
            return (
              <button
                key={repair.id}
                type="button"
                onClick={() => onSelect(repair.id)}
                aria-label={repair.title}
                aria-pressed={isActive}
                className="group absolute grid h-9 w-9 place-items-center"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: "translate(-50%, -50%) translateZ(60px)",
                }}
              >
                {isActive && <span className="absolute inset-1.5 animate-ping rounded-full bg-primary/40" />}
                <span
                  className={`relative grid place-items-center rounded-full font-bold tabular-nums shadow-[0_4px_14px_rgba(0,0,0,0.5)] ring-1 transition-all duration-300 ${
                    isActive
                      ? "h-7 w-7 bg-primary text-[11px] text-[#0b0f0c] ring-primary sm:h-8 sm:w-8 sm:text-xs"
                      : isPreview
                        ? "h-2.5 w-2.5 bg-white text-[0px] text-[#111612] ring-white sm:h-8 sm:w-8 sm:text-xs"
                        : "h-2.5 w-2.5 bg-[#111612] text-[0px] text-white ring-white/70 group-hover:bg-white group-hover:text-[#111612] sm:h-7 sm:w-7 sm:bg-[#111612]/80 sm:text-[11px] sm:backdrop-blur"
                  }`}
                >
                  {index + 1}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

function SymptomChips({ symptoms }: { symptoms: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {symptoms.map((symptom) => (
        <li
          key={symptom}
          className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[13px] text-white/80"
        >
          {symptom}
        </li>
      ))}
    </ul>
  )
}

function RepairExplorer() {
  const [activeId, setActiveId] = useState(laptopRepairs[0].id)
  const [interacted, setInteracted] = useState(false)
  const [autoplay, setAutoplay] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { amount: 0.4 })
  const reduceMotion = useReducedMotion()
  const activeIndex = Math.max(
    0,
    laptopRepairs.findIndex((repair) => repair.id === activeId),
  )
  const active = laptopRepairs[activeIndex]

  useEffect(() => {
    const playing = !interacted && inView && !reduceMotion && window.matchMedia("(min-width: 1024px)").matches
    setAutoplay(playing)
    if (!playing) return
    const timer = window.setInterval(() => {
      setActiveId((current) => {
        const index = laptopRepairs.findIndex((repair) => repair.id === current)
        return laptopRepairs[(index + 1) % laptopRepairs.length].id
      })
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [interacted, inView, reduceMotion])

  const select = (id: string) => {
    setInteracted(true)
    setActiveId(id)
  }

  return (
    <section ref={sectionRef} id="what-we-fix" className="scroll-mt-24 bg-[#111612] py-20 text-white lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow dark>What we fix</Eyebrow>
            <h2 className={`mt-5 ${H2}`}>
              Whatever&apos;s broken, <span className={`${ACCENT} text-primary`}>we&apos;ve seen it before.</span>
            </h2>
          </div>
          <p className="max-w-xs text-pretty text-[15px] leading-relaxed text-white/55">
            <span className="hidden lg:inline">Pick a repair, or click a number on the sketch.</span>
            <span className="lg:hidden">Tap a repair to see where it lives and what it covers.</span>
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="relative z-20 self-start max-lg:sticky max-lg:top-[72px] max-lg:-mx-5 max-lg:bg-[#111612] max-lg:px-5 max-lg:pt-2 lg:sticky lg:top-28">
            <LaptopRender active={active} previewId={previewId} onSelect={select} />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-[#111612] to-transparent lg:hidden"
            />
          </div>

          <ol className="grid gap-1 self-start">
            {laptopRepairs.map((repair, index) => {
              const isActive = repair.id === active.id
              return (
                <li key={repair.id}>
                  <button
                    type="button"
                    onClick={() => select(repair.id)}
                    onMouseEnter={() => setPreviewId(repair.id)}
                    onMouseLeave={() => setPreviewId(null)}
                    aria-pressed={isActive}
                    className={`group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors duration-300 ${
                      isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold tabular-nums transition-colors duration-300 ${
                        isActive ? "border-primary bg-primary text-zinc-950" : "border-white/25 text-white/70"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`flex-1 text-[17px] font-medium tracking-[-0.015em] transition-colors duration-300 ${
                        isActive ? "text-white" : "text-white/60 group-hover:text-white/85"
                      }`}
                    >
                      {repair.title}
                    </span>
                    <Plus
                      className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                        isActive ? "rotate-45 text-primary" : "text-white/30 group-hover:text-white/60"
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="relative pb-6 pl-16 pr-4 pt-1">
                          <p className="text-pretty text-[15px] leading-relaxed text-white/65">{repair.text}</p>
                          <div className="mt-4">
                            <SymptomChips symptoms={repair.symptoms} />
                          </div>
                          <a
                            href={laptopQuoteHref({ issue: repair.issue })}
                            className="group/cta mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-primary hover:text-white"
                          >
                            Quote this repair
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                          </a>
                          {autoplay && (
                            <motion.span
                              aria-hidden
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                              className="absolute bottom-0 left-16 right-4 h-px origin-left bg-primary/70"
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Steps() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const inView = useInView(stageRef, { margin: "-15% 0px -15% 0px" })
  const autoplay = inView

  useEffect(() => {
    if (!autoplay) return
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % steps.length), STEP_AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [autoplay, active])

  const select = (index: number) => setActive(index)

  const current = steps[active]

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <DotField className="[mask-image:linear-gradient(180deg,transparent,#000_14%,#000_86%,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Eyebrow>How it works</Eyebrow>
        <h2 className={`mt-5 max-w-2xl ${H2} text-zinc-950`}>
          No surprises. <span className={`${ACCENT} block text-[#1f7a26]`}>Just a working laptop.</span>
        </h2>

        <div ref={stageRef} className="mt-12 grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="relative">
            <div
              aria-hidden
              className="absolute left-1/2 top-[58%] aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_closest-side,rgba(60,176,67,0.16),transparent)]"
            />
            <div className="relative flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-6">
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold tabular-nums text-zinc-500">
                Step {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
              </span>
              <span className="flex gap-1.5" aria-hidden>
                {steps.map((step, index) => (
                  <span
                    key={step.title}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === active ? "w-6 bg-[#1f7a26]" : "w-1.5 bg-zinc-300"
                    }`}
                  />
                ))}
              </span>
            </div>

            <div className="relative mx-auto w-full max-w-[440px] px-10 pb-6 pt-24 sm:px-14 sm:pt-28">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={active}
                  aria-live="polite"
                  initial={{ opacity: 0, y: 10, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  className="absolute left-1/2 top-0 z-10 w-max max-w-[92%] -translate-x-1/2 text-balance rounded-2xl border-2 border-zinc-950 bg-white px-4 py-2.5 text-center text-[15px] font-semibold leading-snug text-zinc-950 shadow-[4px_4px_0_#111] sm:text-base"
                >
                  {current.say}
                  <span
                    aria-hidden
                    className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-zinc-950 bg-white"
                  />
                </motion.p>
              </AnimatePresence>
              <RepairBuddy step={active} />
            </div>
          </div>

          <div>
            <ol className="grid gap-2">
              {steps.map((step, index) => {
                const isActive = index === active
                return (
                  <li key={step.title}>
                    <button
                      type="button"
                      onClick={() => select(index)}
                      aria-current={isActive ? "step" : undefined}
                      className={`group relative flex w-full gap-5 overflow-hidden rounded-[20px] border p-5 text-left transition-all duration-300 ${
                        isActive
                          ? "border-zinc-200 bg-white shadow-[0_18px_40px_-24px_rgba(17,22,18,0.35)]"
                          : "border-transparent hover:bg-white/60"
                      }`}
                    >
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums transition-colors duration-300 ${
                          isActive
                            ? "bg-[#1f7a26] text-white"
                            : "border border-zinc-300 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-800"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 pt-2">
                        <span
                          className={`block text-lg font-semibold tracking-[-0.02em] transition-colors duration-300 ${
                            isActive ? "text-zinc-950" : "text-zinc-500 group-hover:text-zinc-800"
                          }`}
                        >
                          {step.title}
                        </span>
                        <span
                          className={`grid transition-all duration-300 ${
                            isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <span className="overflow-hidden">
                            <span className="block pt-1.5 text-pretty text-[15px] leading-relaxed text-zinc-600">
                              {step.text}
                            </span>
                          </span>
                        </span>
                      </span>
                      {isActive && autoplay && (
                        <motion.span
                          key={`progress-${active}`}
                          aria-hidden
                          className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[#3CB043]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: STEP_AUTOPLAY_MS / 1000, ease: "linear" }}
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 sm:pl-5">
              <a href={LAPTOP_QUOTE} className={`${BUTTON_BASE} bg-zinc-950 text-white hover:bg-[#1f7a26]`}>
                Start with a free quote
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <span className="text-sm text-zinc-500">or just walk in — no appointment.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <ul className="border-t border-zinc-300" aria-label="Frequently asked questions">
          {laptopRepairFaqs.map((faq, index) => {
            const isOpen = open === index
            return (
              <li key={faq.q} className="border-b border-zinc-300">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className={`text-[17px] font-medium tracking-[-0.015em] transition-colors sm:text-lg ${
                      isOpen ? "text-zinc-950" : "text-zinc-800 group-hover:text-zinc-950"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen ? "rotate-45 border-[#1f7a26] bg-[#1f7a26] text-white" : "border-zinc-300 text-zinc-600"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-3xl text-pretty pb-6 text-base leading-relaxed text-zinc-600">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function ClosingCta({ rating }: { rating: RatingSummary }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24">
      <div className="relative overflow-hidden rounded-[28px] bg-[#111612] px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_100%_0%,rgba(60,176,67,0.22),transparent_70%)]"
        />

        <div className="relative grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <Eyebrow dark>Visit the workshop</Eyebrow>
            <h2 className="mt-6 text-balance text-[40px] font-black leading-[0.98] tracking-[-2px] sm:text-[52px] min-[861px]:text-[58px]">
              Laptop playing up? <span className={`${ACCENT} block text-primary`}>Bring it in today.</span>
            </h2>
            <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-white/70">
              Free diagnosis, an honest price, and your laptop back in your hands fast.
            </p>
            <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
              <a
                href={LAPTOP_QUOTE}
                className={`${BUTTON_BASE} bg-white text-zinc-950 hover:bg-primary hover:text-white`}
              >
                Get a free laptop quote
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href={`tel:${PHONE_NUMBER}`} className={`${BUTTON_BASE} border border-white/30 hover:bg-white/10`}>
                <Phone className="h-4 w-4" />
                Call {PHONE_NUMBER}
              </a>
            </div>
          </div>

          <ul className="divide-y divide-white/15 border-y border-white/15 text-[15px]">
            <li className="py-5">
              <a
                href="https://www.google.com/maps/search/?api=1&query=27+Church+St+Lidcombe+NSW+2141"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block font-medium transition-colors group-hover:text-primary">
                    27 Church St, Lidcombe NSW 2141
                  </span>
                  <span className="mt-0.5 block text-white/55">Walk-ins welcome · Get directions</span>
                </span>
              </a>
            </li>
            <li className="py-5">
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
                <span className="text-[34px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                  {rating.rating.toFixed(1)}
                </span>
                <span>
                  <FiveStars />
                  <span className="mt-1 block text-white/60 transition-colors group-hover:text-white">
                    from{" "}
                    <span className="font-semibold tabular-nums text-white">
                      <ReviewCounter target={rating.reviewCount} suffix={rating.countSuffix} />
                    </span>{" "}
                    Google reviews
                  </span>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export function LaptopRepairPage() {
  const footerSpacer = useFooterSpacer()
  const rating = useGoogleRating()

  return (
    <>
      <div className="relative z-10 bg-[#f5f3ef]">
        <Hero rating={rating} />
        <RepairExplorer />
        <Steps />
        <BrandWall />
        <Faq />
        <ClosingCta rating={rating} />
      </div>
      <div aria-hidden className="pointer-events-none" style={{ height: footerSpacer }} />
      <MobileActionBar quoteHref={LAPTOP_QUOTE} />
    </>
  )
}
