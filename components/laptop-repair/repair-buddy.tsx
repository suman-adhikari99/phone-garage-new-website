"use client"

import { useEffect, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

const INK = "#111111"
const SCREEN = "#111612"
const GLOW = "#4ade80"
const BRAND = "#3CB043"
const HAND_OFFSET = 94

type Pose = { left: number; right: number; head: number; leftLoop?: string; rightLoop?: string }

const POSES: Pose[] = [
  { left: 152, right: -6, head: -5, leftLoop: "buddy-wave" },
  { left: 5, right: -5, head: 0 },
  { left: 6, right: -142, head: -3 },
  { left: -15, right: 15, head: 0 },
]

const LEFT_SHOULDER: [number, number] = [104, 204]
const RIGHT_SHOULDER: [number, number] = [256, 204]
const DIAGNOSIS_PARTS = [
  { label: "Screen", x: 166, y: 222, chipX: 166, chipY: 172, ok: true, hold: 1100 },
  { label: "Keyboard", x: 150, y: 274, chipX: 150, chipY: 226, ok: true, hold: 1100 },
  { label: "Hinge", x: 122, y: 257, chipX: 110, chipY: 209, ok: true, hold: 1100 },
  { label: "Battery", x: 226, y: 192, chipX: 236, chipY: 142, ok: false, hold: 2200 },
]

const SPRINGY = "cubic-bezier(0.34, 1.45, 0.64, 1)"

const KEYFRAMES = `
@keyframes buddy-wave { 0%, 100% { transform: rotate(152deg) } 50% { transform: rotate(122deg) } }
`

function Pivot({
  origin,
  angle,
  loop,
  children,
}: {
  origin: [number, number]
  angle: number
  loop?: string
  children: ReactNode
}) {
  return (
    <g
      style={{
        transformBox: "view-box",
        transformOrigin: `${origin[0]}px ${origin[1]}px`,
        transform: `rotate(${angle}deg)`,
        transition: `transform 0.7s ${SPRINGY}`,
        animation: loop ? `${loop} 1.4s ease-in-out 0.6s infinite` : undefined,
      }}
    >
      {children}
    </g>
  )
}

function armPath([x, y]: [number, number]) {
  return `M${x - 18} ${y} Q${x - 19} ${y + 52} ${x - 13} ${y + 84} L${x + 13} ${y + 84} Q${x + 19} ${y + 52} ${x + 18} ${y} A18 18 0 0 0 ${x - 18} ${y} Z`
}

function Mitten({ shoulder, thumb }: { shoulder: [number, number]; thumb: 1 | -1 }) {
  const [x, y] = shoulder
  const hy = y + HAND_OFFSET
  const shapes = (
    <>
      <ellipse cx={x} cy={hy} rx={19} ry={18} />
      <circle cx={x - 11} cy={hy + 14} r={7.5} />
      <circle cx={x} cy={hy + 17} r={8} />
      <circle cx={x + 11} cy={hy + 14} r={7.5} />
      <ellipse
        cx={x + thumb * 18}
        cy={hy - 2}
        rx={7.5}
        ry={10}
        transform={`rotate(${thumb * -30} ${x + thumb * 18} ${hy - 2})`}
      />
    </>
  )
  return (
    <g>
      <g fill={INK} stroke={INK} strokeWidth={8} strokeLinejoin="round">
        {shapes}
      </g>
      <g fill="#fff">{shapes}</g>
      <g stroke={INK} strokeWidth={2.5} strokeLinecap="round">
        <line x1={x - 5.5} y1={hy + 10} x2={x - 5.5} y2={hy + 16} />
        <line x1={x + 5.5} y1={hy + 10} x2={x + 5.5} y2={hy + 16} />
      </g>
    </g>
  )
}

function Prop({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          {children}
        </motion.g>
      )}
    </AnimatePresence>
  )
}

function useDiagnosisPart(active: boolean, loop: boolean) {
  const [part, setPart] = useState(0)
  const hold = DIAGNOSIS_PARTS[part].hold

  useEffect(() => {
    if (!active) {
      setPart(0)
      return
    }
    if (!loop) {
      setPart(DIAGNOSIS_PARTS.length - 1)
      return
    }
    const timer = window.setTimeout(() => setPart((index) => (index + 1) % DIAGNOSIS_PARTS.length), hold)
    return () => window.clearTimeout(timer)
  }, [active, loop, part, hold])

  return part
}

function DiagnosisLaptop({ part }: { part: number }) {
  const batteryChecked = part === DIAGNOSIS_PARTS.length - 1
  return (
    <>
      <rect x={116} y={176} width={128} height={82} rx={8} fill={SCREEN} stroke={INK} strokeWidth={4} />
      <rect x={124} y={184} width={112} height={66} rx={3} fill="#18221b" />
      <g fill="none" stroke={GLOW} strokeOpacity={0.35} strokeWidth={2.5} strokeLinecap="round">
        <path d="M134 204 h42" />
        <path d="M134 214 h64" />
        <path d="M134 224 h30" />
        <path d="M134 234 h52" />
      </g>
      <rect x={217} y={188} width={16} height={8} rx={2} fill="none" stroke="#e5e7e5" strokeWidth={1.5} />
      <rect x={233.5} y={190.5} width={2} height={3} rx={0.5} fill="#e5e7e5" />
      <motion.rect
        x={219}
        y={190}
        height={4}
        rx={1}
        initial={false}
        animate={{ width: batteryChecked ? 3 : 8, fill: batteryChecked ? "#f59e0b" : GLOW }}
        transition={{ duration: 0.4 }}
      />
      <path
        d="M112 258 H248 L270 300 Q272 305 266 305 H94 Q88 305 90 300 Z"
        fill="url(#buddy-shade)"
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <g fill="#cfcfc8">
        {Array.from({ length: 9 }, (_, key) => (
          <rect key={`a${key}`} x={121 + key * 13.2} y={264} width={10} height={5} rx={1.5} />
        ))}
        {Array.from({ length: 10 }, (_, key) => (
          <rect key={`b${key}`} x={114 + key * 13.2} y={272} width={10} height={5} rx={1.5} />
        ))}
        <rect x={140} y={280} width={80} height={5} rx={1.5} />
      </g>
      <rect x={162} y={289} width={36} height={10} rx={2.5} fill="#e4e4de" stroke="#cfcfc8" strokeWidth={1.5} />
    </>
  )
}

function DiagnosisLens({ part, loop }: { part: number; loop: boolean }) {
  const current = DIAGNOSIS_PARTS[part]
  const chipWidth = current.label.length * 7 + 38
  const tone = current.ok ? GLOW : "#f59e0b"

  return (
    <>
      <motion.g
        initial={false}
        animate={{ x: current.x, y: current.y }}
        transition={{ type: "spring", stiffness: 170, damping: 17 }}
      >
        <motion.circle
          r={22}
          fill="none"
          stroke={tone}
          strokeWidth={3}
          animate={loop ? { scale: [0.8, 1.3], opacity: [0.9, 0] } : { opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
        />
        <line x1={11} y1={11} x2={25} y2={25} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <circle
          r={15}
          fill={current.ok ? "rgba(74,222,128,0.25)" : "rgba(245,158,11,0.3)"}
          stroke={INK}
          strokeWidth={4}
        />
        <path d="M-7 -5 q3 -5 9 -5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      </motion.g>

      <AnimatePresence mode="wait">
        <motion.g
          key={current.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ type: "spring", stiffness: 420, damping: 24, delay: 0.2 }}
        >
          <g transform={`translate(${current.chipX - chipWidth / 2} ${current.chipY})`}>
            <rect
              width={chipWidth}
              height={24}
              rx={12}
              fill={current.ok ? "#fff" : "#fde68a"}
              stroke={INK}
              strokeWidth={2.5}
            />
            <circle cx={13} cy={12} r={7} fill={current.ok ? BRAND : "#f59e0b"} />
            {current.ok ? (
              <path
                d="M9.5 12 l2.5 2.5 l4.5 -4.5"
                fill="none"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path d="M13 8.5 v4 M13 15.2 v0.3" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
            )}
            <text x={26} y={16.5} fontSize={12} fontWeight={700} fill={INK} fontFamily="inherit">
              {current.label}
            </text>
          </g>
        </motion.g>
      </AnimatePresence>
    </>
  )
}

export function RepairBuddy({ step }: { step: number }) {
  const reduceMotion = useReducedMotion()
  const loop = !reduceMotion
  const pose = POSES[step]
  const leftLoop = loop ? pose.leftLoop : undefined
  const rightLoop = loop ? pose.rightLoop : undefined
  const [rx, ry] = RIGHT_SHOULDER
  const handY = ry + HAND_OFFSET
  const happy = step === 3
  const diagnosing = step === 1
  const part = useDiagnosisPart(diagnosing, loop)

  return (
    <svg
      viewBox="36 6 288 364"
      className="h-full w-full overflow-visible"
      role="img"
      aria-label="Phone Garage repair robot"
    >
      <style>{KEYFRAMES}</style>
      <defs>
        <linearGradient id="buddy-shade" x1="0.15" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f3f3ef" />
          <stop offset="1" stopColor="#dcdcd5" />
        </linearGradient>
        <linearGradient id="buddy-visor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2620" />
          <stop offset="1" stopColor={SCREEN} />
        </linearGradient>
      </defs>

      <ellipse cx={180} cy={356} rx={84} ry={9} fill="#000" opacity={0.09} />

      <g fill="url(#buddy-shade)" stroke={INK} strokeWidth={4} strokeLinejoin="round">
        <path d="M140 296 h34 v44 q0 12 -12 12 h-14 q-12 0 -12 -12 Z" />
        <path d="M186 296 h34 v44 q0 12 -12 12 h-14 q-12 0 -12 -12 Z" />
      </g>

      <Pivot origin={LEFT_SHOULDER} angle={pose.left} loop={leftLoop}>
        <path d={armPath(LEFT_SHOULDER)} fill="url(#buddy-shade)" stroke={INK} strokeWidth={4} />
      </Pivot>
      <Pivot origin={RIGHT_SHOULDER} angle={pose.right} loop={rightLoop}>
        <path d={armPath(RIGHT_SHOULDER)} fill="url(#buddy-shade)" stroke={INK} strokeWidth={4} />
      </Pivot>

      <path
        d="M180 148 C 238 148 264 198 268 250 C 272 302 236 330 180 330 C 124 330 88 302 92 250 C 96 198 122 148 180 148 Z"
        fill="url(#buddy-shade)"
        stroke={INK}
        strokeWidth={4}
      />
      <ellipse cx={156} cy={204} rx={34} ry={22} fill="#fff" opacity={0.85} />

      {step !== 1 && !happy && (
        <g>
          <rect x={156} y={226} width={48} height={26} rx={9} fill={SCREEN} stroke={INK} strokeWidth={3} />
          <motion.path
            d="M162 239 h9 l4 -7 l6 14 l5 -9 l3 2 h9"
            fill="none"
            stroke={happy ? GLOW : BRAND}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 1 }}
            animate={loop ? { pathLength: [0, 1, 1], opacity: [1, 1, 0.35] } : undefined}
            transition={{ duration: happy ? 1 : 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      )}

      <Prop show={step === 3}>
        <rect x={134} y={236} width={92} height={58} rx={8} fill={SCREEN} stroke={INK} strokeWidth={4} />
        <rect x={142} y={244} width={76} height={42} rx={4} fill="#18221b" />
        <motion.path
          d="M165 265 l10 10 l22 -22"
          fill="none"
          stroke={GLOW}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
        />
        <path
          d="M122 294 H238 L248 306 Q249 309 246 309 H114 Q111 309 112 306 Z"
          fill="#fff"
          stroke={INK}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      </Prop>

      {diagnosing && <DiagnosisLaptop part={part} />}

      <Pivot origin={LEFT_SHOULDER} angle={pose.left} loop={leftLoop}>
        <Mitten shoulder={LEFT_SHOULDER} thumb={1} />
      </Pivot>
      <Pivot origin={RIGHT_SHOULDER} angle={pose.right} loop={rightLoop}>
        <Mitten shoulder={RIGHT_SHOULDER} thumb={-1} />
        <Prop show={step === 2}>
          <g transform={`rotate(142 ${rx} ${handY})`}>
            <rect x={rx - 33} y={handY - 104} width={66} height={84} rx={10} fill="#fff" stroke={INK} strokeWidth={4} />
            <rect x={rx - 21} y={handY - 92} width={28} height={6} rx={3} fill={INK} />
            <rect x={rx - 21} y={handY - 78} width={42} height={5} rx={2.5} fill="#d4d4cf" />
            <rect x={rx - 21} y={handY - 68} width={32} height={5} rx={2.5} fill="#d4d4cf" />
            <rect x={rx - 21} y={handY - 52} width={42} height={18} rx={9} fill={BRAND} />
            <path
              d={`M${rx - 8} ${handY - 43} l4 4 l8 -8`}
              fill="none"
              stroke="#fff"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </Prop>
      </Pivot>

      <Pivot origin={[180, 152]} angle={pose.head}>
        <line x1={180} y1={46} x2={180} y2={26} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <motion.circle
          cx={180}
          cy={20}
          r={8}
          fill={BRAND}
          stroke={INK}
          strokeWidth={3}
          animate={loop ? { opacity: [1, 0.45, 1] } : undefined}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <g fill="url(#buddy-shade)" stroke={INK} strokeWidth={4}>
          <rect x={98} y={78} width={24} height={48} rx={12} />
          <rect x={238} y={78} width={24} height={48} rx={12} />
        </g>
        <rect x={106} y={92} width={8} height={20} rx={4} fill={BRAND} />
        <rect x={246} y={92} width={8} height={20} rx={4} fill={BRAND} />
        <rect x={112} y={44} width={136} height={112} rx={50} fill="url(#buddy-shade)" stroke={INK} strokeWidth={4} />
        <rect x={127} y={62} width={106} height={76} rx={32} fill="url(#buddy-visor)" stroke={INK} strokeWidth={3} />
        <path
          d="M142 80 Q150 70 166 69"
          fill="none"
          stroke="#fff"
          strokeOpacity={0.28}
          strokeWidth={5}
          strokeLinecap="round"
        />

        <motion.g>
          <motion.g
            initial={false}
            animate={{ x: 0, y: step === 1 ? 5 : step === 2 ? -3 : 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
          >
            {happy ? (
              <g fill="none" stroke={GLOW} strokeWidth={5.5} strokeLinecap="round">
                <path d="M149 106 Q158 93 167 106" />
                <path d="M193 106 Q202 93 211 106" />
              </g>
            ) : (
              <motion.g
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                animate={loop ? { scaleY: [1, 1, 0.1, 1, 1] } : undefined}
                transition={{ duration: 4, times: [0, 0.9, 0.93, 0.96, 1], repeat: Infinity }}
              >
                <ellipse cx={158} cy={101} rx={8} ry={11} fill={GLOW} />
                <ellipse cx={202} cy={101} rx={8} ry={11} fill={GLOW} />
                <circle cx={160.5} cy={97} r={2.5} fill="#fff" opacity={0.8} />
                <circle cx={204.5} cy={97} r={2.5} fill="#fff" opacity={0.8} />
              </motion.g>
            )}
            <ellipse cx={146} cy={122} rx={7} ry={3.5} fill={GLOW} opacity={0.25} />
            <ellipse cx={214} cy={122} rx={7} ry={3.5} fill={GLOW} opacity={0.25} />
          </motion.g>
        </motion.g>
      </Pivot>

      {diagnosing && <DiagnosisLens part={part} loop={loop} />}

      <Prop show={happy}>
        {[
          [86, 58, 1],
          [282, 44, 0.8],
          [298, 140, 0.6],
        ].map(([cx, cy, size], index) => (
          <motion.path
            key={index}
            d={`M${cx} ${cy - 12 * size} Q${cx} ${cy} ${cx + 12 * size} ${cy} Q${cx} ${cy} ${cx} ${cy + 12 * size} Q${cx} ${cy} ${cx - 12 * size} ${cy} Q${cx} ${cy} ${cx} ${cy - 12 * size} Z`}
            fill={BRAND}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={loop ? { scale: [0.6, 1.1, 0.6], opacity: [0.5, 1, 0.5] } : undefined}
            transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.35, ease: "easeInOut" }}
          />
        ))}
      </Prop>
    </svg>
  )
}
