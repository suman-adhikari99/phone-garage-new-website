"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import Script from "next/script"
import Link from "next/link"

type CommonRepairsBackgroundTheme = "white" | "mint" | "sky" | "sand"

const backgroundThemes: Record<
  CommonRepairsBackgroundTheme,
  {
    base: string
    spots: string
    linesPrimary: string
    linesAccent: string
    overlay: string
    accent: string
  }
> = {
  white: {
    base: "linear-gradient(180deg, rgba(241,241,241,0.22) 0%, rgba(241,241,241,0.28) 100%)",
    spots:
      "radial-gradient(45% 35% at 18% 84%, rgba(60,176,67,0.08) 0%, transparent 72%), radial-gradient(42% 32% at 82% 86%, rgba(60,176,67,0.07) 0%, transparent 72%), radial-gradient(30% 22% at 50% 78%, rgba(60,176,67,0.05) 0%, transparent 78%)",
    linesPrimary:
      "repeating-linear-gradient(170deg, rgba(15,23,42,0.035) 0px, rgba(15,23,42,0.035) 1px, transparent 1px, transparent 20px)",
    linesAccent:
      "repeating-linear-gradient(8deg, rgba(60,176,67,0.3) 0px, rgba(60,176,67,0.3) 1px, transparent 1px, transparent 28px)",
    overlay:
      "linear-gradient(to bottom, rgba(241,241,241,0.06), rgba(241,241,241,0.1), rgba(241,241,241,0.16))",
    accent:
      "radial-gradient(ellipse 62% 50% at 50% 52%, rgba(60,176,67,0.08) 0%, transparent 72%)",
  },
  mint: {
    base: "radial-gradient(120% 90% at 50% 100%, rgba(25,128,102,0.2) 0%, rgba(45,181,146,0.14) 30%, rgba(236,251,247,0.9) 66%, rgba(249,255,252,1) 100%)",
    spots:
      "radial-gradient(45% 35% at 18% 84%, rgba(25,128,102,0.14) 0%, transparent 72%), radial-gradient(42% 32% at 82% 86%, rgba(45,181,146,0.12) 0%, transparent 72%), radial-gradient(30% 22% at 50% 78%, rgba(30,160,128,0.1) 0%, transparent 78%)",
    linesPrimary:
      "repeating-linear-gradient(170deg, rgba(10,40,32,0.045) 0px, rgba(10,40,32,0.045) 1px, transparent 1px, transparent 20px)",
    linesAccent:
      "repeating-linear-gradient(8deg, rgba(25,128,102,0.35) 0px, rgba(25,128,102,0.35) 1px, transparent 1px, transparent 30px)",
    overlay:
      "linear-gradient(to bottom, rgba(250,255,252,0.7), rgba(247,255,251,0.74), rgba(242,255,248,0.84))",
    accent:
      "radial-gradient(ellipse 62% 50% at 50% 52%, rgba(25,128,102,0.14) 0%, transparent 72%)",
  },
  sky: {
    base: "radial-gradient(120% 90% at 50% 100%, rgba(45,134,255,0.18) 0%, rgba(106,168,255,0.12) 30%, rgba(241,248,255,0.9) 66%, rgba(255,255,255,1) 100%)",
    spots:
      "radial-gradient(45% 35% at 18% 84%, rgba(45,134,255,0.14) 0%, transparent 72%), radial-gradient(42% 32% at 82% 86%, rgba(106,168,255,0.12) 0%, transparent 72%), radial-gradient(30% 22% at 50% 78%, rgba(72,145,255,0.09) 0%, transparent 78%)",
    linesPrimary:
      "repeating-linear-gradient(170deg, rgba(15,23,42,0.05) 0px, rgba(15,23,42,0.05) 1px, transparent 1px, transparent 20px)",
    linesAccent:
      "repeating-linear-gradient(8deg, rgba(72,145,255,0.35) 0px, rgba(72,145,255,0.35) 1px, transparent 1px, transparent 28px)",
    overlay:
      "linear-gradient(to bottom, rgba(255,255,255,0.68), rgba(252,255,255,0.74), rgba(248,252,255,0.84))",
    accent:
      "radial-gradient(ellipse 62% 50% at 50% 52%, rgba(72,145,255,0.12) 0%, transparent 72%)",
  },
  sand: {
    base: "radial-gradient(120% 90% at 50% 100%, rgba(204,158,92,0.2) 0%, rgba(214,176,120,0.12) 30%, rgba(252,248,241,0.9) 66%, rgba(255,255,255,1) 100%)",
    spots:
      "radial-gradient(45% 35% at 18% 84%, rgba(204,158,92,0.14) 0%, transparent 72%), radial-gradient(42% 32% at 82% 86%, rgba(214,176,120,0.12) 0%, transparent 72%), radial-gradient(30% 22% at 50% 78%, rgba(184,134,78,0.1) 0%, transparent 78%)",
    linesPrimary:
      "repeating-linear-gradient(170deg, rgba(42,28,12,0.04) 0px, rgba(42,28,12,0.04) 1px, transparent 1px, transparent 20px)",
    linesAccent:
      "repeating-linear-gradient(8deg, rgba(184,134,78,0.3) 0px, rgba(184,134,78,0.3) 1px, transparent 1px, transparent 28px)",
    overlay:
      "linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,252,248,0.74), rgba(255,249,240,0.84))",
    accent:
      "radial-gradient(ellipse 62% 50% at 50% 52%, rgba(184,134,78,0.14) 0%, transparent 72%)",
  },
}

function HeroBackgroundVideo() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[#f1f1f1]" />
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-[0.4]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/videos/hero-motion-bg.webm" type="video/webm" />
      </video>
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-[0.22] blur-[0.4px] mix-blend-multiply animate-float"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        style={{ transform: "scale(1.06)" }}
      >
        <source src="/videos/hero-motion-bg.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-white/18" />
    </div>
  )
}

/* ─── Repair card data ─── */
const leftCards = [
  {
    title: "Display Issues / Cracked Screens",
    icon: (
      <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-10 h-10">
        <path
          d="m216.99 475.869a8 8 0 0 1 8-8h62.021a8 8 0 0 1 0 16h-62.021a8 8 0 0 1 -8-8zm-82.611-442.869v446a17.019 17.019 0 0 0 17 17h209.242a17.016 17.016 0 0 0 17-17v-446a17.015 17.015 0 0 0 -17-17h-33.221l-7.628 23.467a8 8 0 0 1 -7.613 5.529h-112.32a8 8 0 0 1 -7.609-5.529l-7.63-23.467h-33.22a17.018 17.018 0 0 0 -17 17zm17 479h209.242a33.033 33.033 0 0 0 33-33v-446a33.039 33.039 0 0 0 -33-33h-209.241a33.039 33.039 0 0 0 -33 33v446a33.033 33.033 0 0 0 33 33z"
          fillRule="evenodd"
        />
      </svg>
    ),
    items: ["Broken glass replacements", "LCD replacements", "Touch IC problems", "Back-light issues"],
  },
  {
    title: "Data Recovery",
    icon: (
      <img
        src="https://img.icons8.com/?size=100&id=frTIXk0UvkY2&format=png&color=3CB043"
        alt="Data recovery icon"
        className="h-10 w-10 object-contain"
      />
    ),
    items: ["Data recovery for photos, videos, contacts, and files on supported devices."],
  },
  {
    title: "Water Damage Repair",
    icon: (
      <svg viewBox="0 0 294.465 294.465" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-10 h-10">
        <path d="M174.432,32.465c-6.8-10-12.8-19.2-18.4-27.6c-0.8-1.2-2-2.4-3.2-3.2c-4.8-3.2-11.2-1.6-14.4,3.2 c-5.2,8.4-11.2,17.2-18.4,27.6c-31.6,46.4-78.8,116.4-78.8,156.4c0,29.2,12,55.6,31.2,74.8c19.2,18.8,45.6,30.8,74.8,30.8 s55.6-12,74.8-31.2c19.2-19.2,31.2-45.6,31.2-74.8C253.232,148.465,206.032,78.865,174.432,32.465z M207.632,248.865 c-15.6,15.6-36.8,24.8-60.4,24.8c-23.6,0-44.8-9.6-60.4-24.8c-15.6-15.6-24.8-36.8-24.8-60.4c0-33.6,45.2-100.4,75.2-144.8 c3.6-5.2,6.8-10.4,10-14.8c3.2,4.4,6.4,9.6,10,14.8c30,44.8,75.2,111.2,75.2,144.8 C232.432,212.065,222.832,233.265,207.632,248.865z" />
        <path d="M209.232,181.265c-5.6-0.4-10.4,4-10.8,9.6c-0.4,8.8-3.2,17.2-7.6,24.4c-4.4,7.2-10.8,13.6-18.4,17.6 c-4.8,2.8-6.8,9.2-4,14c3.2,5.6,9.6,7.2,14.4,4.4c10.8-6,19.6-14.8,25.6-24.8c6.4-10,10-22,10.4-34.4 C219.232,186.465,214.832,181.665,209.232,181.265z" />
      </svg>
    ),
    items: [
      "Professional water damage diagnostics",
      "Component-level repair",
      "Treat quickly to limit corrosion",
      "Helps prevent short circuits",
      "Helps reduce motherboard failure risk",
    ],
  },
]

const rightCards = [
  {
    title: "Speaker / Microphone Issues",
    icon: (
      <svg viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-10 h-10">
        <path d="M278.944,17.577c-5.568-2.656-12.128-1.952-16.928,1.92L106.368,144.009H32c-17.632,0-32,14.368-32,32v128 c0,17.632,14.368,32,32,32h74.368l155.616,124.512c2.912,2.304,6.464,3.488,10.016,3.488c2.368,0,4.736-0.512,6.944-1.568 c5.536-2.688,9.056-8.288,9.056-14.432v-416C288,25.865,284.48,20.265,278.944,17.577z M96,304.009H32v-128h64V304.009z M256,414.697l-128-102.4V167.721l128-102.4V414.697z" />
        <path d="M369.024,126.857c-6.304-6.24-16.416-6.144-22.624,0.128c-6.208,6.304-6.144,16.416,0.128,22.624 c24.16,23.904,37.472,56,37.472,90.4c0,34.4-13.312,66.496-37.472,90.4c-6.304,6.208-6.368,16.32-0.128,22.624 c3.136,3.168,7.264,4.736,11.36,4.736c4.064,0,8.128-1.536,11.264-4.64c30.304-29.92,46.976-70.08,46.976-113.12 C416,196.969,399.328,156.809,369.024,126.857z" />
        <path d="M414.144,81.769c-6.272-6.208-16.416-6.176-22.624,0.096c-6.208,6.272-6.176,16.416,0.096,22.624 C427.968,140.553,448,188.681,448,240.009s-20.032,99.456-56.384,135.52c-6.272,6.208-6.304,16.352-0.096,22.624 c3.136,3.168,7.232,4.736,11.36,4.736c4.064,0,8.128-1.536,11.264-4.64C456.608,356.137,480,299.945,480,240.009 C480,180.073,456.608,123.881,414.144,81.769z" />
      </svg>
    ),
    items: ["Low volume", "Earpiece speaker replacements", "Microphone replacements", "Loudspeaker replacements"],
  },
  {
    title: "Faulty Buttons",
    icon: (
      <svg viewBox="-100 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-10 h-10">
        <path d="m350.22 104.11c0 34.18-16.48 64.52-41.93 83.5v-50.37c0-16.26-6.17-31.71-17.36-43.5-11.41-12.02-26.74-18.87-43.17-19.3-.71-.03-1.29-.03-1.65-.03h-.04c-16.6.02-32.2 6.49-43.93 18.22-11.75 11.77-18.21 27.38-18.21 43.96v51.02c-25.45-18.98-41.93-49.32-41.93-83.5 0-57.5 46.61-104.11 104.11-104.11s104.11 46.61 104.11 104.11z" />
        <path d="m440.076 272.822c-18.19-.49-33.08 14.1-33.08 32.17v-20.78c0-17.54-13.75-32.36-31.28-32.84-18.18-.49-33.08 14.1-33.08 32.17v-20.8c0-17.59-13.83-32.41-31.41-32.82-9.18-.22-17.52 3.42-23.51 9.42-5.83 5.82-9.43 13.87-9.43 22.75v-124.85c0-17.58-13.83-32.41-31.41-32.82-18.22-.5-33.1 14.1-33.1 32.17v209.52l-40.67-40.68c-12.45-12.44-32.62-12.44-45.07 0-12.44 12.45-12.44 32.62 0 45.07l80.74 80.74c22.09 22.09 52.05 34.5 83.29 34.5h47.41c64.69 0 117.15-52.46 117.15-117.15v-62.15c-.01-17.58-13.83-32.41-31.42-32.82z" />
      </svg>
    ),
    items: ["Volume button replacement", "Power button replacement", "Home button replacement", "Fingerprint sensors"],
  },
  {
    title: "Battery Replacement",
    icon: (
      <svg viewBox="-100 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-10 h-10">
        <path d="m232 512h-152c-44.113281 0-80-35.886719-80-80v-312c0-44.113281 35.886719-80 80-80h6v-5.714844c0-18.90625 15.378906-34.285156 34.285156-34.285156h71.429688c18.90625 0 34.285156 15.378906 34.285156 34.285156v5.714844h6c44.113281 0 80 35.886719 80 80v211c0 11.046875-8.953125 20-20 20s-20-8.953125-20-20v-211c0-22.054688-17.945312-40-40-40h-26c-11.046875 0-20-8.953125-20-20v-20h-60v20c0 11.046875-8.953125 20-20 20h-26c-22.054688 0-40 17.945312-40 40v312c0 22.054688 17.945312 40 40 40h152c22.054688 0 40-17.945312 40-40 0-11.046875 8.953125-20 20-20s20 8.953125 20 20c0 44.113281-35.886719 80-80 80zm-6.617188-239.710938c8.195313-9.476562 1.578126-24.289062-11-24.289062h-46.316406l36.59375-59h-70.984375l-46.082031 82.167969c-7.53125 13.421875 2.242188 29.832031 17.71875 29.832031h40.175781l-26.875 74.492188c-.417969.914062-.609375 1.75-.613281 2.507812-.015625 3.144531 2.714844 5.015625 6.210938 5 2.457031-.011719 5.050781-.996094 6.761718-2.699219zm0 0" />
      </svg>
    ),
    items: ["If your battery is not lasting as long as it used to, it can be replaced within 30 minutes."],
  },
]

/* ─── RepairCard with scroll-linked slide animation ─── */
function RepairCard({
  title,
  icon,
  items,
  direction,
  index,
}: {
  title: string
  icon: React.ReactNode
  items: string[]
  direction: "left" | "right"
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    let rafId: number
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const windowH = window.innerHeight
        const triggerStart = windowH + index * 40
        const triggerEnd = windowH * 0.3
        const raw = 1 - (rect.top - triggerEnd) / (triggerStart - triggerEnd)
        setProgress(Math.min(1, Math.max(0, raw)))
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [index])

  const eased = 1 - Math.pow(1 - progress, 3)
  const translateX = direction === "left" ? -80 * (1 - eased) : 80 * (1 - eased)
  const opacity = eased

  return (
    <div
      ref={cardRef}
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        willChange: "transform, opacity",
      }}
      className="group rounded-xl border border-border bg-white/80 backdrop-blur-md p-4 transition-[border-color,background-color] duration-300 active:border-primary/30 active:bg-white hover:border-primary/30 hover:bg-white sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/20">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold text-foreground leading-tight">{title}</h3>
          <div className="mt-2 space-y-1.5 text-sm text-muted-foreground leading-relaxed sm:mt-2.5">
            {items.map((item, i) => (
              <p key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-primary text-xs shrink-0">{"\u2192"}</span>
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main section ─── */
interface CommonPhoneRepairsSectionProps {
  backgroundTheme?: CommonRepairsBackgroundTheme
  customAccentColor?: string
}

export function CommonPhoneRepairsSection({
  backgroundTheme = "white",
  customAccentColor,
}: CommonPhoneRepairsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const [sectionVisible, setSectionVisible] = useState(false)
  const theme = backgroundThemes[backgroundTheme]

  /* Intersection observer for entrance animation */
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* Scroll-linked parallax for the ground background — moves only on scroll (NO ZOOM) */
  const rafRef = useRef<number>(0)

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const section = sectionRef.current
      const bg = bgRef.current
      if (!section || !bg) return

      const rect = section.getBoundingClientRect()
      const windowH = window.innerHeight
      const sectionH = section.offsetHeight

      // progress: 0 when section top enters viewport, 1 when section bottom leaves
      const progress = Math.min(1, Math.max(0, (windowH - rect.top) / (windowH + sectionH)))

      // ✅ Subtle parallax only (movement), NO scale()
      const yShift = (progress - 0.5) * -90
      bg.style.transform = `translate3d(0, ${yShift}px, 0)`
    })
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [onScroll])

  return (
    <>
      <Script
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        type="module"
        strategy="afterInteractive"
      />

      <section ref={sectionRef} className="relative" style={{ backgroundColor: "#f1f1f1" }}>
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28">
          <div className="relative rounded-2xl border border-border overflow-hidden">
            <HeroBackgroundVideo />

            {/* ═══ PARALLAX GROUND TEXTURE — NO ZOOM ═══ */}
            <div className="absolute inset-0">
              <div
                ref={bgRef}
                className="absolute -inset-32 will-change-transform"
                style={{ transform: "translate3d(0, 0, 0)" }} // ✅ removed scale(1.2)
              >
                <div className="absolute inset-0" style={{ background: theme.base }} />
                <div className="absolute inset-0 opacity-40" style={{ background: theme.spots }} />
                <div className="absolute inset-0 opacity-[0.14]" style={{ background: theme.linesPrimary }} />
                <div className="absolute inset-0 opacity-[0.08]" style={{ background: theme.linesAccent }} />
              </div>

              <div className="absolute inset-0" style={{ background: theme.overlay }} />

              <div
                className="absolute inset-0 opacity-25"
                style={{
                  background: customAccentColor
                    ? `radial-gradient(ellipse 62% 50% at 50% 52%, ${customAccentColor} 0%, transparent 72%)`
                    : theme.accent,
                }}
              />
            </div>

            {/* Header */}
            <div className="relative border-b border-border px-5 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-8">
              <div
                className="text-center"
                style={{
                  opacity: sectionVisible ? 1 : 0,
                  transform: sectionVisible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.8s ease, transform 0.8s ease",
                }}
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  Common Phone Repairs
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="relative px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 items-start">
                {/* Left */}
                <div className="flex flex-col gap-4">
                  {leftCards.map((card, i) => (
                    <RepairCard
                      key={card.title}
                      title={card.title}
                      icon={card.icon}
                      items={card.items}
                      direction="left"
                      index={i}
                    />
                  ))}
                </div>

                {/* Center — 3D rotating phone */}
                <div className="flex items-center justify-center order-first lg:order-none py-4 lg:py-0">
                  <div
                    className="relative w-full"
                    style={{
                      maxWidth: 320,
                      aspectRatio: "9/16",
                      opacity: sectionVisible ? 1 : 0,
                      transform: sectionVisible ? "scale(1)" : "scale(0.88)",
                      transition:
                        "opacity 1s cubic-bezier(0.16,1,0.3,1) 0.3s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.3s",
                    }}
                  >
                    <div
                      className="absolute inset-0 -m-6 rounded-full blur-3xl"
                      style={{
                        background: "radial-gradient(ellipse at center, rgba(60,176,67,0.12) 0%, transparent 70%)",
                      }}
                    />

                    {React.createElement(
                      "model-viewer",
                      {
                        src: "/models/iphone.glb",
                        loading: "eager",
                        // ✅ ONLY disable zoom (wheel / pinch) 
                        // "disable-zoom": true, 
                        "auto-rotate": true,
                        "camera-controls": true,
                        "rotation-per-second": "30deg",
                        "interaction-prompt": "none",
                        "camera-orbit": "0deg 75deg 105%",
                        "min-camera-orbit": "auto auto 105%",
                        "max-camera-orbit": "auto auto 90%",
                        "field-of-view": "30deg",
                        ar: true,
                        "tone-mapping": "commerce",
                        "shadow-intensity": "1.2",
                        "shadow-softness": "0.8",
                        exposure: "1.0",
                        "environment-image": "neutral",
                        style: {
                          width: "100%",
                          height: "100%",
                          cursor: "grab",
                          ["--poster-color" as string]: "transparent",
                        },
                      } as React.HTMLAttributes<HTMLElement>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col gap-4">
                  {rightCards.map((card, i) => (
                    <RepairCard
                      key={card.title}
                      title={card.title}
                      icon={card.icon}
                      items={card.items}
                      direction="right"
                      index={i}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative border-t border-border px-5 py-4 sm:px-8 lg:px-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="text-[13px] text-muted-foreground sm:text-sm">
                  All repairs come with a 6 month warranty. Free diagnostic assessment on every device.
                </p>

                <Link
                  href="/book"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors active:text-primary/80 hover:text-primary/80 sm:text-sm"
                >
                  Book a Repair
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
