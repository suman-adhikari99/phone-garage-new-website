"use client"

import {
  Smartphone,
  Battery,
  Droplets,
  Camera,
  Plug,
  Volume2,
  HardDrive,
  Settings,
  ArrowRight,
} from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const services = [
  {
    icon: Smartphone,
    title: "Screen Replacement",
    description:
      "Cracked or shattered screen? We replace screens for all major brands with premium quality parts, restoring your display to perfect clarity.",
    time: "30-60 min",
    color: "bg-[#3CB043]/10 text-[#3CB043]",
  },
  {
    icon: Battery,
    title: "Battery Replacement",
    description:
      "If your phone dies too quickly, a new battery can bring it back to life. We use genuine-quality batteries for lasting performance.",
    time: "20-30 min",
    color: "bg-[#3CB043]/10 text-[#3CB043]",
  },
  {
    icon: Droplets,
    title: "Water Damage Repair",
    description:
      "Dropped your phone in water? Our advanced micro-soldering techniques can recover water-damaged devices and restore full functionality.",
    time: "1-3 hours",
    color: "bg-[#3CB043]/10 text-[#3CB043]",
  },
  {
    icon: Camera,
    title: "Camera Repair",
    description:
      "Blurry photos or a cracked lens? We repair front and rear cameras to get your phone capturing crystal-clear images again.",
    time: "30-45 min",
    color: "bg-[#3CB043]/10 text-[#3CB043]",
  },
  {
    icon: Plug,
    title: "Charging Port Repair",
    description:
      "Phone not charging properly? We repair or replace damaged charging ports so your device stays powered up and connected.",
    time: "20-40 min",
    color: "bg-[#3CB043]/10 text-[#3CB043]",
  },
  {
    icon: Volume2,
    title: "Speaker & Mic Fix",
    description:
      "Can't hear callers or they can't hear you? We fix all audio issues including speakers, microphones, and earpieces.",
    time: "20-30 min",
    color: "bg-[#3CB043]/10 text-[#3CB043]",
  },
  {
    icon: HardDrive,
    title: "Data Recovery",
    description:
      "Lost precious photos or contacts? Our data recovery service retrieves information from damaged or malfunctioning devices.",
    time: "1-24 hours",
    color: "bg-[#3CB043]/10 text-[#3CB043]",
  },
  {
    icon: Settings,
    title: "Software Repair",
    description:
      "Freezing, crashing, or stuck on boot? We diagnose and fix all software issues, from OS updates to virus removal.",
    time: "30-60 min",
    color: "bg-[#3CB043]/10 text-[#3CB043]",
  },
]

export function Services() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.05)

  return (
    <section id="services" className="relative bg-background py-20 lg:py-28">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`mb-16 text-center transition-all duration-700 ${
            headerVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Our Services
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Expert Repair Services for{" "}
            <span className="text-primary">Every Device</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            From quick screen fixes to complex motherboard repairs, our
            certified technicians handle it all with precision and care.
          </p>
        </div>

        {/* Services grid */}
        <div
          ref={gridRef}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 ${
                gridVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: gridVisible ? `${index * 80}ms` : "0ms",
              }}
            >
              {/* Top accent line on hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />

              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${service.color} transition-all duration-300 group-hover:scale-110`}
              >
                <service.icon className="h-6 w-6" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                {service.title}
              </h3>

              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {service.time}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
