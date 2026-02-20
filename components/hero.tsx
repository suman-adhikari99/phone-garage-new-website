"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import {
  ArrowRight,
  Shield,
  Clock,
  Award,
  Star,
  PhoneCall,
  Smartphone,
  SmartphoneNfc,
  Search,
  ChevronRight,
  Laptop,
  Tablet,
  Watch,
  Monitor,
  Battery,
  Camera,
  Cpu,
  Wifi,
  Droplets,
  Wrench,
  CheckCircle2,
  CircleAlert,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, useInView, AnimatePresence } from "framer-motion"

/* ------------------------------------------------------------------ */
/*  Easing                                                              */
/* ------------------------------------------------------------------ */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

/* ------------------------------------------------------------------ */
/*  Counter                                                             */
/* ------------------------------------------------------------------ */
function Counter({
  target,
  suffix = "",
  duration = 2,
}: {
  target: number
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let raf: number
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = (now - start) / (duration * 1000)
      if (elapsed >= 1) {
        setCount(target)
      } else {
        setCount(Math.floor(target * easeOutCubic(elapsed)))
        raf = requestAnimationFrame(step)
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Typewriter                                                          */
/* ------------------------------------------------------------------ */
function TypewriterWord({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0)
  const [text, setText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[idx]
    let timer: ReturnType<typeof setTimeout>
    if (!deleting && text === word) {
      timer = setTimeout(() => setDeleting(true), 2400)
    } else if (deleting && text === "") {
      setDeleting(false)
      setIdx((i) => (i + 1) % words.length)
    } else {
      timer = setTimeout(
        () =>
          setText(
            deleting
              ? word.slice(0, text.length - 1)
              : word.slice(0, text.length + 1)
          ),
        deleting ? 35 : 75
      )
    }
    return () => clearTimeout(timer)
  }, [text, deleting, idx, words])

  return (
    <>
      {text}
      <motion.span
        className="inline-block w-[3px] h-[0.85em] bg-[#3CB043] ml-0.5 align-middle rounded-full"
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Spring presets                                                      */
/* ------------------------------------------------------------------ */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 80, damping: 18, mass: 0.9 },
  },
}

/* ================================================================== */
/*                                                                      */
/*  REPAIR TRACKER STEPS (inside the phone)                             */
/*                                                                      */
/* ================================================================== */
const TRACKING_STEPS = [
  { id: 0, label: "Select", icon: Smartphone, duration: 3000 },
  { id: 1, label: "Diagnose", icon: Search, duration: 7000 },
  { id: 2, label: "Repair", icon: Wrench, duration: 7600 },
  { id: 3, label: "Done", icon: CheckCircle2, duration: 5200 },
]

type TrackingDevice = {
  name: string
  kind: string
  note: string
  color: string
  icon: LucideIcon
  logoGif?: string
}

const TRACKING_DEVICES: TrackingDevice[] = [
  {
    name: "Android",
    kind: "Phone",
    note: "Display, charging, battery",
    color: "#34A853",
    icon: SmartphoneNfc,
    logoGif: "https://img.icons8.com/cotton/64/iphone-x--v2.png",
  },
  {
    name: "iPhone",
    kind: "Phone",
    note: "Screen, camera, back glass",
    color: "#2563eb",
    icon: Smartphone,
    logoGif: "https://img.icons8.com/dotty/80/iphone17-pro.png",
  },
  {
    name: "Laptop",
    kind: "Laptop",
    note: "Logic board, keyboard, SSD",
    color: "#0ea5e9",
    icon: Laptop,
    logoGif: "https://img.icons8.com/glyph-neue/64/mac-book-air.png",
  },
  {
    name: "Tablet",
    kind: "Tablet",
    note: "Touch panel, battery, charge",
    color: "#8b5cf6",
    icon: Tablet,
    logoGif: "https://img.icons8.com/ios/50/ipad.png",
  },
  {
    name: "Smart Watch",
    kind: "Watch",
    note: "Screen, battery, side crown",
    color: "#f59e0b",
    icon: Watch,
    logoGif: "https://img.icons8.com/glyph-neue/64/apple-watch.png",
  },
]

const TRACKING_DIAG_ITEMS = [
  { label: "Display Module", icon: Monitor, status: "issue", detail: "Cracked OLED panel" },
  { label: "Battery Health", icon: Battery, status: "good", detail: "92% capacity" },
  { label: "Camera System", icon: Camera, status: "good", detail: "All lenses functional" },
  { label: "Water Indicators", icon: Droplets, status: "good", detail: "No water damage" },
  { label: "Logic Board", icon: Cpu, status: "good", detail: "All circuits normal" },
] as const

function ScreenStatusCard() {
  const [step, setStep] = useState(0)
  const [cycleKey, setCycleKey] = useState(0)
  const [progress, setProgress] = useState(0)
  const [selectRevealIdx, setSelectRevealIdx] = useState(0)
  const [diagnosisIdx, setDiagnosisIdx] = useState(0)
  const [selectedDevice, setSelectedDevice] = useState(-1)
  const [repairPercent, setRepairPercent] = useState(0)

  const runCycle = useCallback(() => {
    setStep(0)
    setProgress(0)
    setSelectRevealIdx(0)
    setDiagnosisIdx(0)
    setSelectedDevice(-1)
    setRepairPercent(0)

    const selectTimers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < TRACKING_DEVICES.length; i++) {
      selectTimers.push(setTimeout(() => setSelectRevealIdx(i + 1), 320 + i * 450))
    }
    const t0 = setTimeout(() => setSelectedDevice(0), 800)
    const t0b = setTimeout(() => setStep(1), TRACKING_STEPS[0].duration)

    const diagTimers: ReturnType<typeof setTimeout>[] = []
    const diagStart = TRACKING_STEPS[0].duration
    for (let i = 0; i < TRACKING_DIAG_ITEMS.length; i++) {
      diagTimers.push(setTimeout(() => setDiagnosisIdx(i + 1), diagStart + 700 + i * 850))
    }
    const t1 = setTimeout(() => setStep(2), diagStart + TRACKING_STEPS[1].duration)

    const repairStart = diagStart + TRACKING_STEPS[1].duration
    const repairTicks: ReturnType<typeof setTimeout>[] = []
    const totalTicks = 30
    for (let i = 0; i <= totalTicks; i++) {
      repairTicks.push(
        setTimeout(
          () => setRepairPercent(Math.round((i / totalTicks) * 100)),
          repairStart + (i / totalTicks) * (TRACKING_STEPS[2].duration - 600)
        )
      )
    }
    const t2 = setTimeout(() => setStep(3), repairStart + TRACKING_STEPS[2].duration)

    const completeStart = repairStart + TRACKING_STEPS[2].duration
    const tReset = setTimeout(() => setCycleKey((k) => k + 1), completeStart + TRACKING_STEPS[3].duration)

    return () => {
      clearTimeout(t0)
      clearTimeout(t0b)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(tReset)
      selectTimers.forEach(clearTimeout)
      diagTimers.forEach(clearTimeout)
      repairTicks.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    const cleanup = runCycle()
    return cleanup
  }, [cycleKey, runCycle])

  useEffect(() => {
    setProgress(step)
  }, [step])

  const activeDeviceName = TRACKING_DEVICES[Math.max(selectedDevice, 0)]?.name ?? TRACKING_DEVICES[0].name

  return (
    <div className="h-full px-3.5 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold text-[#1c1c1e] leading-none">Repair Tracker</p>
          <p className="mt-0.5 text-[12px] text-[#8e8e93]">Live repair status</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3CB043] opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3CB043]" />
          </span>
          <span className="text-[12px] font-semibold text-[#3CB043]">Live</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-1.5">
        {TRACKING_STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = step === i
          const isDone = step > i
          return (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className="flex flex-col items-center">
                <motion.div
                  className="flex h-7 w-7 items-center justify-center rounded-full border"
                  animate={{
                    borderColor: isDone || isActive ? "#3CB043" : "#d1d5db",
                    backgroundColor: isDone ? "#3CB043" : "rgba(0,0,0,0)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                  ) : (
                    <Icon className="h-4.5 w-4.5" style={{ color: isActive ? "#3CB043" : "#9ca3af" }} />
                  )}
                </motion.div>
                <span
                  className="mt-1 text-[10px] font-semibold leading-none"
                  style={{ color: isDone || isActive ? "#3CB043" : "#9ca3af" }}
                >
                  {s.label}
                </span>
              </div>
              {i < TRACKING_STEPS.length - 1 && (
                <div className="relative h-[2px] w-5 overflow-hidden rounded-full bg-[#e5e7eb]">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#3CB043]"
                    animate={{ width: progress > i ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="relative mt-2 min-h-[268px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                Select your device
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {TRACKING_DEVICES.map((d, i) => {
                  const isSelected = selectedDevice === i
                  const revealed = i < selectRevealIdx
                  const DeviceIcon = d.icon
                  const hasLogoGif = Boolean(d.logoGif)
                  return (
                    <motion.div
                      key={d.name}
                      className="relative flex items-center gap-2.5 rounded-lg border px-2 py-1.5"
                      initial={{ opacity: 0, x: 14 }}
                      animate={
                        revealed
                          ? {
                              opacity: 1,
                              x: 0,
                              borderColor: isSelected ? "#3CB043" : "#e5e7eb",
                              backgroundColor: "rgba(0,0,0,0)",
                            }
                          : {
                              opacity: 0.22,
                              x: 0,
                              borderColor: "#e5e7eb",
                              backgroundColor: "rgba(0,0,0,0)",
                            }
                      }
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    >
                      <motion.div
                        className="absolute left-0 top-1/2 h-8 w-[2px] -translate-y-1/2 rounded-r-full"
                        style={{ backgroundColor: d.color }}
                        animate={{ opacity: isSelected ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                      />
                      <div
                        className="relative flex h-[52px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-white/80"
                        style={{
                          backgroundColor: "rgba(60,176,67,0.1)",
                        }}
                      >
                        <div className="pointer-events-none absolute inset-[1px] rounded-[11px] border border-white/70" />
                        <div className="relative z-10 flex h-full w-full items-center justify-center">
                          {hasLogoGif ? (
                            <img
                              src={d.logoGif}
                              alt={`${d.name} logo`}
                              className="h-7 w-7 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <>
                              <DeviceIcon
                                className="absolute h-9 w-9 opacity-[0.16]"
                                style={{ color: d.color }}
                                strokeWidth={1.7}
                              />
                              <DeviceIcon
                                className="relative h-7 w-7"
                                style={{ color: isSelected ? d.color : "#64748b" }}
                                strokeWidth={2.1}
                              />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[11px] font-semibold text-[#111827]">{d.name}</p>
                        <p className="line-clamp-1 text-[8px] font-medium text-[#64748b]">{d.note}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <span
                          className="rounded-full border px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.08em]"
                          style={{
                            color: isSelected ? d.color : "#94a3b8",
                            borderColor: isSelected ? `${d.color}3d` : "#dbe1ea",
                            backgroundColor: isSelected ? `${d.color}12` : "rgba(255,255,255,0.8)",
                          }}
                        >
                          {d.kind}
                        </span>
                        <span
                          className="flex h-4.5 w-4.5 items-center justify-center rounded-full border"
                          style={{
                            borderColor: isSelected ? `${d.color}6e` : "#d1d5db",
                            backgroundColor: isSelected ? `${d.color}1a` : "rgba(255,255,255,0.75)",
                          }}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="h-3.5 w-3.5" style={{ color: d.color }} />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#d1d5db]" />
                          )}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              {selectedDevice >= 0 && (
                <motion.div
                  className="mt-2.5 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#3CB043]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Proceeding
                  <ChevronRight className="h-3.5 w-3.5" />
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="diagnosis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Running diagnostics</p>
                <span className="text-[11px] font-bold text-[#111827]">{activeDeviceName}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {TRACKING_DIAG_ITEMS.map((item, i) => {
                  const Icon = item.icon
                  const revealed = i < diagnosisIdx
                  const isIssue = item.status === "issue"

                  return (
                    <motion.div
                      key={item.label}
                      className="flex items-center gap-2 rounded-lg border px-2 py-1.5"
                      initial={{ opacity: 0, x: 14 }}
                      animate={
                        revealed
                          ? {
                              opacity: 1,
                              x: 0,
                              borderColor: isIssue ? "#ef444440" : "#e5e7eb",
                              backgroundColor: "rgba(0,0,0,0)",
                            }
                          : {
                              opacity: 0.22,
                              x: 0,
                              borderColor: "#e5e7eb",
                              backgroundColor: "rgba(0,0,0,0)",
                            }
                      }
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    >
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: revealed
                            ? isIssue
                              ? "rgba(239,68,68,0.1)"
                              : "rgba(60,176,67,0.1)"
                            : "rgba(156,163,175,0.1)",
                        }}
                      >
                        {revealed && isIssue ? (
                          <CircleAlert className="h-4 w-4 text-[#ef4444]" />
                        ) : (
                          <Icon className="h-4 w-4" style={{ color: revealed ? "#3CB043" : "#9ca3af" }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-[#111827]">{item.label}</p>
                        {revealed && (
                          <p className="truncate text-[10px]" style={{ color: isIssue ? "#ef4444" : "#6b7280" }}>
                            {item.detail}
                          </p>
                        )}
                      </div>
                      {revealed &&
                        (isIssue ? (
                          <span className="rounded-full bg-[#ef4444]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#ef4444]">
                            ISSUE
                          </span>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-[#3CB043]" />
                        ))}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="repairing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="flex h-full flex-col items-center justify-center"
            >
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Repair in progress</p>

              <div className="relative mb-3">
                <svg width="112" height="112" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#3CB043"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - repairPercent / 100) }}
                    transition={{ duration: 0.15, ease: "linear" }}
                    style={{ transformOrigin: "50px 50px", rotate: "-90deg" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold leading-none text-[#111827]">{repairPercent}%</span>
                  <span className="mt-0.5 text-[10px] text-[#6b7280]">Complete</span>
                </div>
              </div>

              <div className="flex w-full items-center justify-between rounded-xl border border-[#d1d5db] bg-[#f3f4f6] px-3 py-2.5">
                <div>
                  <p className="text-[12px] font-semibold text-[#111827]">Replacing Display Module</p>
                  <p className="text-[10px] text-[#6b7280]">{activeDeviceName} Service</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold text-[#3CB043]">~25 min</p>
                  <p className="text-[10px] text-[#6b7280]">remaining</p>
                </div>
              </div>
              <p className="mt-5 text-center text-[11px] font-semibold leading-snug text-[#334155]">
                We know this device holds your memories, so we repair it with heart.
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="flex h-full flex-col items-center justify-center"
            >
              <div className="relative mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#3CB043]/10">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3CB043]/20" />
                <motion.div
                  className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#3CB043]/30"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg viewBox="0 0 52 52" className="h-10 w-10" aria-hidden="true">
                    <motion.circle
                      cx="26"
                      cy="26"
                      r="20"
                      fill="none"
                      stroke="#3CB043"
                      strokeWidth="2.75"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0.4 }}
                      animate={{ pathLength: [0, 1, 1], opacity: [0.4, 1, 1] }}
                      transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.2, times: [0, 0.65, 1] }}
                    />
                    <motion.path
                      d="M16 27.5L23.5 35L37 19"
                      fill="none"
                      stroke="#3CB043"
                      strokeWidth="3.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 1] }}
                      transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.2, times: [0.05, 0.75, 1] }}
                    />
                  </svg>
                </motion.div>
              </div>
              <div className="mb-1 flex items-center rounded-full bg-[#3CB043]/10 px-2 py-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3CB043] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3CB043]" />
                </span>
              </div>
              <p className="text-xl font-extrabold text-[#111827]">Repair Complete!</p>
              <p className="mt-0.5 text-[11px] text-[#6b7280]">Ready for pickup</p>

              <div className="mt-3 w-full rounded-lg border border-[#3CB043]/20 p-2.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Repair Summary</span>
                  <span className="rounded-full bg-[#3CB043]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#3CB043]">
                    WARRANTY
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Service</span>
                    <span className="font-semibold text-[#111827]">Screen Replacement</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Warranty</span>
                    <span className="font-semibold text-[#3CB043]">6 Months</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 grid w-full grid-cols-2 gap-1.5 text-[10px]">
                <div className="rounded-lg border border-[#e5e7eb] px-2 py-1.5">
                  <p className="text-[#6b7280]">Pickup Slot</p>
                  <p className="font-semibold text-[#111827]">Today, 5:30 PM</p>
                </div>
                <div className="rounded-lg border border-[#e5e7eb] px-2 py-1.5 text-right">
                  <p className="text-[#6b7280]">Need Help?</p>
                  <p className="font-semibold text-[#111827]">Call Front Desk</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ================================================================== */
/*                                                                      */
/*  HYPER-REALISTIC IPHONE 15 PRO FRAME                                 */
/*                                                                      */
/* ================================================================== */
function HeroVisual() {
  return (
    <div className="relative w-[300px] sm:w-[330px] md:w-[350px]">
      <motion.div
        className="relative"
        initial={{ y: 600, opacity: 0, scale: 0.88 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          delay: 0.6,
          duration: 2.8,
          ease: [0.25, 0.1, 0.25, 1],
          opacity: { delay: 0.6, duration: 1.4, ease: "easeOut" },
          scale: { delay: 0.6, duration: 3.2, ease: [0.25, 0.1, 0.25, 1] },
        }}
        style={{ perspective: "1200px" }}
      >
        {/* Phone container with subtle 3D tilt */}
        <motion.div
          className="relative"
          animate={{ rotateY: [0, 1.5, 0, -1.5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* ==== OUTER CHAMFER (polished mirror edge) ==== */}
          <div
            className="relative rounded-[56px]"
            style={{
              padding: "3px",
              background: "conic-gradient(from 145deg, #ffffff 0deg, #d8d8dc 40deg, #a0a0a4 90deg, #88888c 140deg, #a0a0a4 180deg, #c8c8cc 220deg, #e8e8ec 270deg, #ffffff 320deg, #f0f0f4 360deg)",
              boxShadow: "0 80px 160px -30px rgba(0,0,0,0.3), 0 30px 60px -15px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.06)",
            }}
          >
            {/* ==== TITANIUM FRAME BODY ==== */}
            <div
              className="relative rounded-[54px]"
              style={{
                padding: "5px",
                background: "linear-gradient(170deg, #d0d0d4 0%, #bababc 10%, #acacb0 25%, #9e9ea2 50%, #acacb0 75%, #bababc 90%, #d0d0d4 100%)",
                boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.7), inset 0 -1.5px 0 rgba(0,0,0,0.08)",
              }}
            >
              {/* Subtle brushed metal texture */}
              <div
                className="pointer-events-none absolute inset-[2px] z-[1] rounded-[53px] opacity-[0.05]"
                style={{
                  backgroundImage: "repeating-linear-gradient(95deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, transparent 3px)",
                }}
              />

              {/* ==== INNER BEZEL (dark housing around screen) ==== */}
              <div
                className="relative rounded-[50px]"
                style={{
                  padding: "6px",
                  background: "linear-gradient(180deg, #252527 0%, #1c1c1e 25%, #141416 60%, #111113 100%)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.35), inset 0 0 0 0.5px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.12)",
                }}
              >
                {/* Antenna isolation lines */}
                <div className="absolute top-[3px] left-[22%] right-[22%] h-[0.5px] bg-gradient-to-r from-transparent via-[#9a9a9e]/30 to-transparent" />
                <div className="absolute bottom-[3px] left-[22%] right-[22%] h-[0.5px] bg-gradient-to-r from-transparent via-[#9a9a9e]/30 to-transparent" />

                {/* ==== SIDE BUTTONS (silver, 3D depth) ==== */}
                {/* Action Button */}
                <div
                  className="absolute -left-[8px] top-[88px] h-[24px] w-[7px] rounded-l-[3px]"
                  style={{
                    background: "linear-gradient(90deg, #dcdce0 0%, #c4c4c8 20%, #b0b0b4 45%, #a0a0a4 70%, #9a9a9e 100%)",
                    boxShadow: "-2px 0 6px rgba(0,0,0,0.15), -1px 0 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(0,0,0,0.1)",
                  }}
                />
                {/* Volume Up */}
                <div
                  className="absolute -left-[8px] top-[130px] h-[36px] w-[7px] rounded-l-[3px]"
                  style={{
                    background: "linear-gradient(90deg, #dcdce0 0%, #c4c4c8 20%, #b0b0b4 45%, #a0a0a4 70%, #9a9a9e 100%)",
                    boxShadow: "-2px 0 6px rgba(0,0,0,0.15), -1px 0 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(0,0,0,0.1)",
                  }}
                />
                {/* Volume Down */}
                <div
                  className="absolute -left-[8px] top-[176px] h-[36px] w-[7px] rounded-l-[3px]"
                  style={{
                    background: "linear-gradient(90deg, #dcdce0 0%, #c4c4c8 20%, #b0b0b4 45%, #a0a0a4 70%, #9a9a9e 100%)",
                    boxShadow: "-2px 0 6px rgba(0,0,0,0.15), -1px 0 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(0,0,0,0.1)",
                  }}
                />
                {/* Power Button (right) */}
                <div
                  className="absolute -right-[8px] top-[150px] h-[54px] w-[7px] rounded-r-[3px]"
                  style={{
                    background: "linear-gradient(270deg, #dcdce0 0%, #c4c4c8 20%, #b0b0b4 45%, #a0a0a4 70%, #9a9a9e 100%)",
                    boxShadow: "2px 0 6px rgba(0,0,0,0.15), 1px 0 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(0,0,0,0.1)",
                  }}
                />

                {/* ==== SCREEN GLASS ==== */}
                <div
                  className="relative overflow-hidden rounded-[44px]"
                  style={{
                    boxShadow: "inset 0 0 0 1.5px rgba(0,0,0,0.15), inset 0 2px 10px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Earpiece speaker grille */}
                  <div className="absolute top-[6px] left-1/2 z-50 -translate-x-1/2">
                    <div className="flex gap-[1px]">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[2px] w-[1.5px] rounded-full bg-[#2a2a2e]" />
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Island */}
                  <div className="absolute top-[14px] left-1/2 z-40 -translate-x-1/2">
                    <div
                      className="relative h-[36px] w-[130px] rounded-full"
                      style={{
                        backgroundColor: "#000000",
                        boxShadow: "0 1px 5px rgba(0,0,0,0.15), inset 0 0.5px 0 rgba(255,255,255,0.015)",
                      }}
                    >
                      {/* Front camera lens (multi-element) */}
                      <div className="absolute left-[14px] top-1/2 -translate-y-1/2 flex items-center gap-[8px]">
                        <div
                          className="relative h-[16px] w-[16px] rounded-full"
                          style={{
                            background: "radial-gradient(circle at 36% 30%, #2a2a40 0%, #16162a 30%, #0a0a16 60%, #000 100%)",
                            boxShadow: "0 0 0 2.5px rgba(25,25,35,0.8), 0 0 0 3.5px rgba(15,15,20,0.4), inset 0 0.5px 2px rgba(255,255,255,0.04)",
                          }}
                        >
                          {/* Iris */}
                          <div className="absolute inset-[4px] rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, #1a1a30 0%, #0a0a18 100%)", border: "0.5px solid rgba(50,50,70,0.3)" }} />
                          {/* Lens specular */}
                          <div className="absolute top-[2px] left-[4px] h-[3.5px] w-[3.5px] rounded-full bg-[#ffffff]/[0.15]" />
                          {/* Secondary reflection */}
                          <div className="absolute bottom-[3px] right-[3px] h-[1.5px] w-[1.5px] rounded-full bg-[#ffffff]/[0.05]" />
                        </div>
                        {/* Green active indicator */}
                        <div
                          className="h-[8px] w-[8px] rounded-full"
                          style={{
                            background: "radial-gradient(circle at 40% 35%, #5ae66c 0%, #32d74b 50%, #28b83e 100%)",
                            boxShadow: "0 0 8px 2px rgba(50,215,75,0.45), 0 0 3px rgba(50,215,75,0.3), inset 0 1px 1px rgba(255,255,255,0.2)",
                          }}
                        />
                      </div>
                      {/* Face ID components */}
                      <div className="absolute right-[14px] top-1/2 -translate-y-1/2 flex items-center gap-[5px]">
                        <div className="h-[5px] w-[5px] rounded-full" style={{ background: "radial-gradient(circle, #12121e, #000)", boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.03)" }} />
                        <div className="h-[4px] w-[4px] rounded-full" style={{ background: "radial-gradient(circle, #14142a, #000)", boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.02)" }} />
                      </div>
                    </div>
                  </div>

                  {/* ==== SCREEN DISPLAY ==== */}
                  <div
                    className="relative aspect-[9/19.5] w-full"
                    style={{
                      background: "radial-gradient(ellipse 85% 55% at 50% 38%, #ffffff 0%, #f8f8fa 30%, #f0f0f2 55%, #eaeaec 80%, #e4e4e6 100%)",
                    }}
                  >
                    {/* Screen content */}
                    <div className="relative z-10 flex h-full flex-col px-4 pt-[58px] pb-4">
                      {/* iOS Status Bar */}
                      <div className="flex items-center justify-between mb-5 px-1">
                        <span className="text-[10px] font-semibold text-[#1c1c1e] tabular-nums">9:41</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-end gap-[1.5px]">
                            {[4, 6, 8, 10].map((h, i) => (
                              <div key={i} className="rounded-[0.5px] bg-[#1c1c1e]" style={{ width: "2.5px", height: `${h}px` }} />
                            ))}
                          </div>
                          <Wifi className="h-[11px] w-[11px] text-[#1c1c1e]" />
                          <div className="flex items-center gap-[2px]">
                            <div className="relative h-[9px] w-[18px] rounded-[2.5px] border-[1.5px] border-[#1c1c1e]">
                              <div className="absolute inset-[1.5px] rounded-[1px] bg-[#1c1c1e]" style={{ width: "65%" }} />
                            </div>
                            <div className="h-[4px] w-[1.5px] rounded-r-[1px] bg-[#1c1c1e]" />
                          </div>
                        </div>
                      </div>

                      {/* Phone Garage logo */}
                      <motion.div
                        className="flex justify-center mb-2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.9, type: "spring", stiffness: 200, damping: 18 }}
                      >
                        <img
                          src="https://www.phonegarage.com.au/headerTop.png"
                          alt=""
                          className="h-[22px] w-auto opacity-70"
                          aria-hidden="true"
                        />
                      </motion.div>

                      {/* Repair tracker label */}
                      <motion.p
                        className="text-center text-[9px] font-bold uppercase tracking-[0.25em] text-[#3CB043]/70 mb-3"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.4 }}
                      >
                        Diagnostic Centre
                      </motion.p>

                      {/* Repair tracker steps */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.5 }}
                        className="flex-1 min-h-0 overflow-hidden"
                      >
                        <ScreenStatusCard />
                      </motion.div>

                      {/* Home indicator */}
                      <div className="mt-auto pt-3 flex justify-center">
                        <div className="h-[5px] w-[130px] rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.18)" }} />
                      </div>
                    </div>

                    {/* Glass reflections -- diagonal sweep */}
                    <div
                      className="pointer-events-none absolute inset-0 z-20"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 15%, transparent 40%, transparent 65%, rgba(255,255,255,0.06) 100%)",
                      }}
                    />
                    {/* Bottom-right soft reflection */}
                    <div
                      className="pointer-events-none absolute inset-0 z-20"
                      style={{
                        background: "linear-gradient(315deg, rgba(255,255,255,0.15) 0%, transparent 25%)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outer chamfer catch light (very bright top edge) */}
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-[56px]"
            style={{
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.85), inset 0 -2px 0 rgba(0,0,0,0.06), inset 2px 0 0 rgba(255,255,255,0.2), inset -2px 0 0 rgba(0,0,0,0.03)",
            }}
          />
        </motion.div>

        {/* 3D shadow system */}
        <div className="relative mt-2">
          <div className="mx-auto h-2 w-[50%] rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.12)", filter: "blur(4px)" }} />
          <div className="mx-auto -mt-0.5 h-4 w-[65%] rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.06)", filter: "blur(10px)" }} />
          <div className="mx-auto -mt-1 h-6 w-[80%] rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.03)", filter: "blur(20px)" }} />
        </div>
      </motion.div>
    </div>
  )
}

function HeroBackgroundVideo() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[#f4f5f6]" />
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-[0.3]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source
          src="/videos/hero-motion-bg.webm"
          type="video/webm"
        />
      </video>
      <div className="absolute inset-0 bg-white/45" />
    </div>
  )
}

/* ================================================================== */
/*                                                                      */
/*  HERO EXPORT                                                         */
/*                                                                      */
/* ================================================================== */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section
      ref={ref}
  id="hero"
  className="relative min-h-[auto] overflow-hidden lg:min-h-[100dvh]"
  style={{ backgroundColor: "transparent" }}
  >
      {/* Animated background -- Phone Garage style video */}
      <HeroBackgroundVideo />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-5 pt-24 pb-16 lg:min-h-[100dvh] lg:flex-row lg:gap-16 lg:pt-28 lg:pb-20 xl:gap-24">
        {/* ---- LEFT COLUMN ---- */}
        <motion.div
          className="flex max-w-2xl flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          variants={stagger}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#3CB043]/20 bg-[#3CB043]/[0.06] px-5 py-2 text-[13px] font-semibold text-[#4a0d1a] tracking-wide"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3CB043] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3CB043]" />
            </span>
            {"Sydney\u2019s Trusted Repair Experts"}
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="mb-5 text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem] xl:text-[4.25rem]"
          >
            <span className="block text-balance">{"We Don\u2019t Just Fix Phones"}</span>
            <span className="mt-1.5 block text-[0.52em] font-medium text-muted-foreground sm:mt-2">
              {"We restore your "}
              <span className="font-bold text-[#3CB043]">
                <TypewriterWord words={["Connections", "Memories", "Business", "Confidence"]} />
              </span>
            </span>
          </motion.h1>

          {/* Body */}
          <motion.p
            variants={fadeUp}
            className="mb-9 max-w-lg text-base leading-relaxed text-muted-foreground lg:text-[17px]"
          >
            Walk in with a broken device, walk out with peace of mind.
            Same-day repairs by certified technicians, backed by a 6-month
            warranty on every fix.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="mb-10 flex flex-col gap-3.5 sm:flex-row">
            <Button
              size="lg"
              className="bg-[rgba(21,33,21,1)] text-[#ffffff] hover:bg-[rgba(28,44,28,1)] h-[52px] px-8 text-[15px] font-semibold shadow-lg shadow-[rgba(21,33,21,0.28)] transition-all hover:shadow-xl hover:shadow-[rgba(21,33,21,0.36)] hover:-translate-y-0.5 active:translate-y-0"
              asChild
            >
              <a href="/quote">
                Get a quote
                <ArrowRight className="ml-2 h-[18px] w-[18px]" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-[52px] border-[rgba(21,33,21,0.35)] bg-transparent px-8 text-[15px] font-semibold text-[rgba(21,33,21,1)] transition-all hover:-translate-y-0.5 hover:border-[rgba(21,33,21,1)] hover:bg-[rgba(21,33,21,1)] hover:text-[#ffffff] active:translate-y-0"
              asChild
            >
              <a href="tel:+61400000000">
                <PhoneCall className="mr-2 h-[18px] w-[18px]" />
                Call (02) 1234 5678
              </a>
            </Button>
          </motion.div>

          {/* Trust strip */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-6 gap-y-4">
            {[
              { Icon: Clock, label: "30 Min Repairs" },
              { Icon: Shield, label: "6 Month Warranty" },
              { Icon: Award, label: "Certified Techs" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <b.Icon className="h-[18px] w-[18px] text-[#3CB043]" />
                <span className="text-sm font-semibold text-foreground">{b.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {["J", "S", "M", "A", "R"].map((c, i) => (
                <motion.span
                  key={c}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-[#ffffff] ring-[3px] ring-background"
                  style={{
                    backgroundColor: ["#3CB043", "#2d8a34", "#228B22", "#1a7a28", "#15652e"][i],
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ delay: 1.1 + i * 0.08, type: "spring", stiffness: 260, damping: 18 }}
                >
                  {c}
                </motion.span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#facc15] text-[#facc15]" />
                ))}
                <span className="ml-1.5 text-sm font-bold text-foreground">4.9</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {"from "}
                <span className="font-semibold text-foreground">
                  <Counter target={500} suffix="+" duration={1.8} />
                </span>
                {" Google reviews"}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* ---- RIGHT COLUMN ---- */}
        <motion.div
          className="relative flex flex-1 items-center justify-center lg:justify-end"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <HeroVisual />
        </motion.div>
      </div>

      {/* Brand marquee */}
      <div className="relative border-t border-border bg-secondary/40 py-5 overflow-hidden">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50 mb-3.5">
          Brands we service
        </p>
        <div className="flex animate-marquee whitespace-nowrap">
          {[0, 1].map((s) => (
            <div key={s} className="flex items-center gap-14 px-7">
              {["Apple", "Samsung", "Google", "Huawei", "OPPO", "OnePlus", "Xiaomi", "Sony", "Motorola", "Nokia"].map(
                (b) => (
                  <span
                    key={`${s}-${b}`}
                    className="text-[13px] font-bold tracking-wide text-muted-foreground/30 uppercase select-none"
                  >
                    {b}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
