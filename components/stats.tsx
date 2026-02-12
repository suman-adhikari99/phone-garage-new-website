"use client"

import { useScrollAnimation, useCountUp } from "@/hooks/use-scroll-animation"

const stats = [
  { value: 15000, suffix: "+", label: "Devices Repaired" },
  { value: 98, suffix: "%", label: "Customer Satisfaction" },
  { value: 10, suffix: "+", label: "Years Experience" },
  { value: 6, suffix: " Mo", label: "Repair Warranty" },
]

export function Stats() {
  const { ref, isVisible } = useScrollAnimation(0.3)

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#0a0a0a] py-16 lg:py-20"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(#3CB043 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              stat={stat}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({
  stat,
  index,
  isVisible,
}: {
  stat: { value: number; suffix: string; label: string }
  index: number
  isVisible: boolean
}) {
  const count = useCountUp(stat.value, 2000, true, isVisible)

  return (
    <div
      className={`flex flex-col items-center text-center transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: isVisible ? `${index * 150}ms` : "0ms" }}
    >
      <div className="mb-2 text-4xl font-bold text-[#f8f9fa] tabular-nums sm:text-5xl lg:text-6xl">
        {count.toLocaleString()}
        <span className="text-[#3CB043]">{stat.suffix}</span>
      </div>
      <div className="text-sm text-[#6b7280] font-medium tracking-wide uppercase">
        {stat.label}
      </div>
    </div>
  )
}
