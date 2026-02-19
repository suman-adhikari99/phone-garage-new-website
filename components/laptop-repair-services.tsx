import { CheckCircle2 } from "lucide-react"

const laptopRepairHighlights = [
  "Display & Power - Screen replacement, battery, charging issues",
  "Performance & Data - OS repair, SSD upgrades, boot & data safety",
  "Advanced Repairs - Motherboard, overheating, fan & thermal issues",
  "Physical Damage - Hinges, keyboard, trackpad & body repair",
]

export function LaptopRepairServicesSection() {
  return (
    <section className="relative border-t border-border py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="h-full w-full object-cover scale-[1.02] opacity-25 saturate-[0.7] brightness-[0.75]"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src="/videos/wmremove-transformed.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0b1220]/72" />
      </div>
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border border-white/10 bg-[#0f172a]/62 px-4 py-6 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.8)] backdrop-blur-[3px] sm:px-6 lg:px-10">
          <div className="pointer-events-none absolute -bottom-9 right-[2.5rem] hidden h-24 w-24 rotate-45 border border-white/30 lg:block" />
          <div className="pointer-events-none absolute -bottom-9 right-[7rem] hidden h-24 w-24 rotate-45 border border-white/30 lg:block" />
          <div className="pointer-events-none absolute -bottom-9 right-[11.5rem] hidden h-24 w-24 rotate-45 border border-white/30 lg:block" />

          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#ff8e66] sm:text-sm">
            Why Choose Our Laptop Repairs
          </p>

          <h2 className="mt-4 max-w-5xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[5rem]">
            Laptop Repair, Done Right
          </h2>

          <p className="mt-5 max-w-5xl text-lg leading-relaxed text-white/85 sm:text-xl sm:leading-[1.45]">
            Fast, reliable repair for all laptop issues - from cracked screens to complex motherboard faults.
            We fix your laptop with precision, transparency, and data-safe care.
          </p>

          <h3 className="mt-8 text-2xl font-bold text-white sm:text-3xl">What We Fix</h3>

          <div className="mt-6 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {laptopRepairHighlights.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-[#ff8e66]" />
                <p className="text-[1.1rem] font-semibold leading-snug text-white/90 sm:text-[1.35rem]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
