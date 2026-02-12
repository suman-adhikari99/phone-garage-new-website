"use client"

import React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import {
  ArrowRight,
  Shield,
  Clock,
  Award,
  Star,
  PhoneCall,
  Smartphone,
  Monitor,
  Battery,
  Camera,
  Cpu,
  Wifi,
  Volume2,
  Zap,
  Settings,
  HardDrive,
  FolderOpen,
  Droplets,
  CircuitBoard,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ShieldCheck,
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
/*  REPAIR SCENARIOS + DIAGNOSTIC ENGINE                                */
/*                                                                      */
/* ================================================================== */
type ComponentStatus = "ok" | "issue" | "warning"

type IconProps = {
  className?: string
  style?: React.CSSProperties
}

interface DiagComponent {
  name: string
  Icon: React.ComponentType<IconProps>
  status: ComponentStatus
}

interface RepairScenario {
  device: string
  DeviceIcon: React.ComponentType<IconProps>
  issue: string
  repairLabel: string
  components: DiagComponent[]
}

const SCENARIOS: RepairScenario[] = [
  {
    device: "iPhone 15 Pro",
    DeviceIcon: Smartphone,
    issue: "Cracked Display",
    repairLabel: "Screen Replacement",
    components: [
      { name: "Display", Icon: Monitor, status: "issue" },
      { name: "Touch IC", Icon: Cpu, status: "warning" },
      { name: "Battery", Icon: Battery, status: "ok" },
      { name: "Camera", Icon: Camera, status: "ok" },
    ],
  },
  {
    device: "Samsung S24 Ultra",
    DeviceIcon: Smartphone,
    issue: "Water Damage",
    repairLabel: "Water Recovery",
    components: [
      { name: "Logic Board", Icon: CircuitBoard, status: "issue" },
      { name: "Speaker", Icon: Volume2, status: "issue" },
      { name: "Battery", Icon: Battery, status: "warning" },
      { name: "Display", Icon: Monitor, status: "ok" },
    ],
  },
  {
    device: "Google Pixel 8",
    DeviceIcon: Smartphone,
    issue: "Software Failure",
    repairLabel: "Software Recovery",
    components: [
      { name: "System OS", Icon: Settings, status: "issue" },
      { name: "Firmware", Icon: HardDrive, status: "issue" },
      { name: "User Data", Icon: FolderOpen, status: "warning" },
      { name: "Wi-Fi", Icon: Wifi, status: "ok" },
    ],
  },
  {
    device: "iPad Pro M2",
    DeviceIcon: Smartphone,
    issue: "Charging Failure",
    repairLabel: "Port Replacement",
    components: [
      { name: "Charge Port", Icon: Zap, status: "issue" },
      { name: "Power IC", Icon: Cpu, status: "warning" },
      { name: "Battery", Icon: Battery, status: "warning" },
      { name: "Display", Icon: Monitor, status: "ok" },
    ],
  },
]

const STAGE_MS = [2200, 2000, 2800, 2600]

/* ------------------------------------------------------------------ */
/*  Status helpers                                                      */
/* ------------------------------------------------------------------ */
function getStatusDisplay(
  comp: DiagComponent,
  stage: number,
  scanIdx: number,
  rowIdx: number
): { label: string; color: string; BgIcon: React.ComponentType<IconProps> | null } {
  if (stage === 0) {
    if (rowIdx <= scanIdx) return { label: "Scanned", color: "rgba(255,255,255,0.35)", BgIcon: null }
    return { label: "Queued", color: "rgba(255,255,255,0.15)", BgIcon: null }
  }
  if (stage === 3) {
    if (comp.status === "ok") return { label: "Passed", color: "#3CB043", BgIcon: CheckCircle2 }
    return { label: "Repaired", color: "#3CB043", BgIcon: CheckCircle2 }
  }
  if (comp.status === "ok") return { label: "Healthy", color: "#3CB043", BgIcon: CheckCircle2 }
  if (comp.status === "issue") {
    if (stage >= 2) return { label: "Repairing", color: "#3CB043", BgIcon: Wrench }
    return { label: "Failed", color: "#ef4444", BgIcon: XCircle }
  }
  if (stage >= 2) return { label: "Verified", color: "#3CB043", BgIcon: CheckCircle2 }
  return { label: "Warning", color: "#f59e0b", BgIcon: AlertTriangle }
}

function stageBorderColor(comp: DiagComponent, stage: number, isScanning: boolean): string {
  if (isScanning) return "rgba(60,176,67,0.3)"
  if (stage === 0) return "#e5e5e5"
  if (stage === 3) return "rgba(60,176,67,0.25)"
  if (comp.status === "issue") return stage >= 2 ? "rgba(60,176,67,0.25)" : "rgba(239,68,68,0.3)"
  if (comp.status === "warning") return stage >= 2 ? "rgba(60,176,67,0.2)" : "rgba(245,158,11,0.3)"
  return "rgba(60,176,67,0.15)"
  }
  
function stageBgColor(comp: DiagComponent, stage: number, isScanning: boolean): string {
  if (isScanning) return "rgba(60,176,67,0.06)"
  if (stage === 0) return "#ffffff"
  if (stage === 3) return "rgba(60,176,67,0.04)"
  if (comp.status === "issue") return stage >= 2 ? "rgba(60,176,67,0.04)" : "rgba(239,68,68,0.04)"
  if (comp.status === "warning") return stage >= 2 ? "rgba(60,176,67,0.03)" : "rgba(245,158,11,0.04)"
  return "#ffffff"
  }

/* ================================================================== */
/*                                                                      */
/*  SCREEN STATUS CARD (inside the phone)                               */
/*                                                                      */
/* ================================================================== */
function ScreenStatusCard() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [stage, setStage] = useState(0)
  const [scanIdx, setScanIdx] = useState(-1)

  const scenario = SCENARIOS[scenarioIdx]

  const advance = useCallback(() => {
    setScenarioIdx((p) => (p + 1) % SCENARIOS.length)
    setStage(0)
    setScanIdx(-1)
  }, [])

  useEffect(() => {
    let dead = false
    const timers: ReturnType<typeof setTimeout>[] = []

    // Scan each row
    for (let i = 0; i < scenario.components.length; i++) {
      timers.push(setTimeout(() => { if (!dead) setScanIdx(i) }, 300 * (i + 1)))
    }

    // Stage transitions
    let acc = 0
    for (let s = 1; s <= 3; s++) {
      acc += STAGE_MS[s - 1]
      const ns = s
      timers.push(setTimeout(() => { if (!dead) setStage(ns) }, acc))
    }

    acc += STAGE_MS[3]
    timers.push(setTimeout(() => { if (!dead) advance() }, acc))

    return () => { dead = true; timers.forEach(clearTimeout) }
  }, [scenarioIdx, scenario.components.length, advance])

  const stageLabel = [
    "Diagnosing components\u2026",
    `Found: ${scenario.issue}`,
    `${scenario.repairLabel}\u2026`,
    "All systems operational",
  ][stage]

  const stageColor = [
    "#3CB043",
    stage === 1 ? "#f59e0b" : "#3CB043",
    "#3CB043",
    "#3CB043",
  ][stage]

  const pct = [20, 50, 82, 100][stage]

  const issueCount = scenario.components.filter((c) => c.status !== "ok").length
  const passedCount = stage === 3 ? scenario.components.length : scenario.components.filter((c) => c.status === "ok").length

  return (
    <div className="flex flex-col gap-2">
      {/* ------ Device header ------ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scenarioIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center gap-3 rounded-xl bg-white border border-[#e5e5e5] px-4 py-3 shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3CB043]/10">
            <scenario.DeviceIcon className="h-5 w-5 text-[#3CB043]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-[#1c1c1e] leading-tight">{scenario.device}</p>
            <p className="text-[11px] text-[#8e8e93] leading-tight mt-0.5">{scenario.issue}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ backgroundColor: stageColor }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: stageColor }} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: stageColor }}>
              {stage === 3 ? "Done" : "Live"}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ------ Progress ------ */}
      <div className="rounded-xl bg-white border border-[#e5e5e5] px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={`${scenarioIdx}-${stage}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[12px] font-semibold leading-none"
              style={{ color: stageColor }}
            >
              {stageLabel}
            </motion.span>
          </AnimatePresence>
          <span className="text-[11px] text-[#8e8e93] font-mono tabular-nums">{pct}%</span>
        </div>
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#e5e5ea]">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: stageColor }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          />
        </div>
        {/* Mini stats row */}
        <div className="mt-2 flex items-center gap-4">
          <span className="text-[10px] text-[#8e8e93]">
            <span className="font-semibold text-[#3CB043]">{passedCount}</span> passed
          </span>
          {stage >= 1 && stage < 3 && (
            <span className="text-[10px] text-[#8e8e93]">
              <span className="font-semibold text-[#ef4444]">{issueCount}</span> {issueCount === 1 ? "issue" : "issues"}
            </span>
          )}
          {stage === 3 && (
            <span className="text-[10px] text-[#8e8e93]">
              <span className="font-semibold text-[#3CB043]">{issueCount}</span> repaired
            </span>
          )}
        </div>
      </div>

      {/* ------ Component rows ------ */}
      <div className="flex flex-col gap-1.5">
        {scenario.components.map((comp, i) => {
          const isScanning = stage === 0 && i === scanIdx
          const sd = getStatusDisplay(comp, stage, scanIdx, i)
          return (
            <motion.div
              key={`${scenarioIdx}-${comp.name}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{
                opacity: 1,
                x: 0,
                backgroundColor: stageBgColor(comp, stage, isScanning),
                borderColor: stageBorderColor(comp, stage, isScanning),
              }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5"
              style={{ border: "1px solid #e5e5e5" }}
            >
              {/* Left: icon + name */}
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: isScanning
                      ? "rgba(60,176,67,0.12)"
                      : comp.status === "issue" && stage >= 1 && stage < 3
                        ? "rgba(239,68,68,0.1)"
                        : comp.status === "warning" && stage >= 1 && stage < 3
                          ? "rgba(245,158,11,0.1)"
                          : stage === 3
                            ? "rgba(60,176,67,0.1)"
                            : "#f2f2f7",
                  }}
                >
                  <comp.Icon
                    className="h-4 w-4"
                    style={{
                      color: isScanning
                        ? "#3CB043"
                        : comp.status === "issue" && stage >= 1 && stage < 3
                          ? "#ef4444"
                          : comp.status === "warning" && stage >= 1 && stage < 3
                            ? "#f59e0b"
                            : stage === 3
                              ? "#3CB043"
                              : "#8e8e93",
                    }}
                  />
                </div>
                <span className="text-[12px] font-medium text-[#3a3a3c]">{comp.name}</span>
              </div>

              {/* Right: status badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${scenarioIdx}-${comp.name}-${sd.label}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                  style={{
                    backgroundColor: sd.BgIcon
                      ? sd.color === "#3CB043"
                        ? "rgba(60,176,67,0.08)"
                        : sd.color === "#ef4444"
                          ? "rgba(239,68,68,0.08)"
                          : sd.color === "#f59e0b"
                            ? "rgba(245,158,11,0.08)"
                            : "transparent"
                      : "transparent",
                  }}
                >
                  {sd.BgIcon && (
                    <sd.BgIcon className="h-3 w-3" style={{ color: sd.color }} />
                  )}
                  {stage === 0 && isScanning && (
                    <Loader2 className="h-3 w-3 animate-spin" style={{ color: "#3CB043" }} />
                  )}
                  <span className="text-[10px] font-bold" style={{ color: sd.color }}>
                    {sd.label}
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* ------ Completion banner ------ */}
      <AnimatePresence>
        {stage === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="flex items-center gap-3 rounded-xl bg-[#3CB043]/[0.08] border border-[#3CB043]/25 px-4 py-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3CB043]/20">
              <ShieldCheck className="h-5 w-5 text-[#3CB043]" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#3CB043] leading-tight">All systems verified</p>
              <p className="text-[10px] text-[#3CB043]/50 leading-tight mt-0.5">6 month warranty activated</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

                      {/* Diagnostics label */}
                      <motion.p
                        className="text-center text-[9px] font-bold uppercase tracking-[0.25em] text-[#3CB043]/70 mb-3"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.4 }}
                      >
                        Diagnostic Centre
                      </motion.p>

                      {/* Diagnostic engine */}
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
      {/* Animated background -- Mobile Pitstop style video */}
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
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#3CB043]/20 bg-[#3CB043]/[0.06] px-5 py-2 text-[13px] font-semibold text-[#2d8a34] tracking-wide"
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
              className="bg-[#3CB043] text-[#ffffff] hover:bg-[#2d8a34] h-[52px] px-8 text-[15px] font-semibold shadow-lg shadow-[#3CB043]/20 transition-all hover:shadow-xl hover:shadow-[#3CB043]/30 hover:-translate-y-0.5 active:translate-y-0"
              asChild
            >
              <a href="#contact">
                Get a Free Quote
                <ArrowRight className="ml-2 h-[18px] w-[18px]" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border bg-transparent text-foreground hover:bg-secondary h-[52px] px-8 text-[15px] font-semibold hover:-translate-y-0.5 transition-all active:translate-y-0"
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
