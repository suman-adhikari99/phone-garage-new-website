"use client"

import { useEffect, useRef } from "react"

const GAP = 18
const RADIUS = 130
const PUSH = 12
const RIPPLE_SPEED = 0.55
const RIPPLE_BAND = 46
const RIPPLE_LIFE = 1400
const IDLE: [number, number, number] = [217, 217, 211]
const ACTIVE: [number, number, number] = [60, 176, 67]

type Dot = { x: number; y: number; ox: number; oy: number; scale: number; tint: number }
type Ripple = { x: number; y: number; start: number }

export function DotField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const context = canvas?.getContext("2d")
    if (!canvas || !host || !context) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let dots: Dot[] = []
    let ripples: Ripple[] = []
    let pointer: { x: number; y: number } | null = null
    let frame = 0
    let width = 0
    let height = 0

    const layout = () => {
      const rect = host.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      dots = []
      for (let y = GAP / 2; y < height; y += GAP) {
        for (let x = GAP / 2; x < width; x += GAP) dots.push({ x, y, ox: 0, oy: 0, scale: 1, tint: 0 })
      }
      draw(performance.now())
    }

    const draw = (now: number) => {
      ripples = ripples.filter((ripple) => now - ripple.start < RIPPLE_LIFE)
      context.clearRect(0, 0, width, height)
      let moving = false

      for (const dot of dots) {
        let targetX = 0
        let targetY = 0
        let targetScale = 1
        let targetTint = 0

        if (pointer) {
          const dx = dot.x - pointer.x
          const dy = dot.y - pointer.y
          const distance = Math.hypot(dx, dy)
          if (distance < RADIUS) {
            const force = (1 - distance / RADIUS) ** 2
            if (!reduceMotion && distance > 0.01) {
              targetX += (dx / distance) * force * PUSH
              targetY += (dy / distance) * force * PUSH
            }
            targetScale += force * 1.7
            targetTint = Math.max(targetTint, force * 1.4)
          }
        }

        for (const ripple of ripples) {
          const age = now - ripple.start
          const dx = dot.x - ripple.x
          const dy = dot.y - ripple.y
          const distance = Math.hypot(dx, dy)
          const band = 1 - Math.abs(distance - age * RIPPLE_SPEED) / RIPPLE_BAND
          if (band <= 0) continue
          const strength = band * (1 - age / RIPPLE_LIFE)
          if (!reduceMotion && distance > 0.01) {
            targetX += (dx / distance) * strength * 6
            targetY += (dy / distance) * strength * 6
          }
          targetScale += strength * 1.2
          targetTint = Math.max(targetTint, strength)
        }

        dot.ox += (targetX - dot.ox) * 0.14
        dot.oy += (targetY - dot.oy) * 0.14
        dot.scale += (targetScale - dot.scale) * 0.14
        dot.tint += (Math.min(targetTint, 1) - dot.tint) * 0.14
        if (Math.abs(targetX - dot.ox) + Math.abs(targetY - dot.oy) + Math.abs(targetScale - dot.scale) > 0.01)
          moving = true

        const t = dot.tint
        const r = Math.round(IDLE[0] + (ACTIVE[0] - IDLE[0]) * t)
        const g = Math.round(IDLE[1] + (ACTIVE[1] - IDLE[1]) * t)
        const b = Math.round(IDLE[2] + (ACTIVE[2] - IDLE[2]) * t)
        context.fillStyle = `rgb(${r} ${g} ${b})`
        context.beginPath()
        context.arc(dot.x + dot.ox, dot.y + dot.oy, dot.scale, 0, Math.PI * 2)
        context.fill()
      }

      frame = moving || pointer || ripples.length ? requestAnimationFrame(draw) : 0
    }

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const localPoint = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      pointer = localPoint(event)
      ripples.push({ ...pointer, start: performance.now() })
      wake()
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      pointer = localPoint(event)
      wake()
    }
    const onLeave = () => {
      pointer = null
      wake()
    }
    const onDown = (event: PointerEvent) => {
      ripples.push({ ...localPoint(event), start: performance.now() })
      wake()
    }

    const observer = new ResizeObserver(layout)
    observer.observe(host)
    host.addEventListener("pointerenter", onEnter)
    host.addEventListener("pointermove", onMove)
    host.addEventListener("pointerleave", onLeave)
    host.addEventListener("pointerdown", onDown)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      host.removeEventListener("pointerenter", onEnter)
      host.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerleave", onLeave)
      host.removeEventListener("pointerdown", onDown)
    }
  }, [])

  return (
    <canvas ref={canvasRef} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
  )
}
