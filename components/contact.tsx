"use client"

import { useState, type FormEvent } from "react"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
  Smartphone,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "(02) 1234 5678",
    href: "tel:+61212345678",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@phonegarage.com.au",
    href: "mailto:info@phonegarage.com.au",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Sydney, NSW, Australia",
    href: "#",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon-Sat: 9am - 6pm",
    href: "#",
  },
]

const quoteHighlights = [
  { icon: Clock, label: "10-min response" },
  { icon: ShieldCheck, label: "Warranty-backed repairs" },
  { icon: Sparkles, label: "Transparent pricing" },
]

export function Contact() {
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation()
  const { ref: infoRef, isVisible: infoVisible } = useScrollAnimation()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section
      id="contact-section"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(60,176,67,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_42%),linear-gradient(180deg,#f8fbf8_0%,#edf5ef_100%)] py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#3CB043]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#22c55e]/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div
            ref={formRef}
            className={`transition-all duration-700 ${
              formVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-[30px] border border-[#d7e6da] bg-white/95 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#3CB043]/10 blur-2xl" />
              <div className="relative">
                <span className="inline-flex items-center rounded-full bg-[#3CB043]/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#2d8a34]">
                  Get A Quote
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl text-balance">
                  Tell Us About Your Device
                </h2>
                <p className="mt-3 max-w-2xl text-[#4b5563] leading-relaxed">
                  Share a few details and our team will send a tailored quote fast.
                  Designed for quick booking, clear communication, and zero back-and-forth.
                </p>

                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {quoteHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-xl border border-[#dce9df] bg-[#f6fbf7] px-3 py-2 text-xs font-semibold text-[#305f39]"
                    >
                      <item.icon className="h-3.5 w-3.5 text-[#2d8a34]" />
                      {item.label}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4b5563]"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                        <Input
                          id="name"
                          placeholder="John Smith"
                          className="h-12 rounded-xl border-[#d8e6db] bg-[#f7fbf8] pl-10 text-[15px] text-[#0f172a] placeholder:text-[#8b939f] focus:border-[#3CB043] focus:ring-[#3CB043]/20"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4b5563]"
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="0400 000 000"
                          className="h-12 rounded-xl border-[#d8e6db] bg-[#f7fbf8] pl-10 text-[15px] text-[#0f172a] placeholder:text-[#8b939f] focus:border-[#3CB043] focus:ring-[#3CB043]/20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4b5563]"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 rounded-xl border-[#d8e6db] bg-[#f7fbf8] pl-10 text-[15px] text-[#0f172a] placeholder:text-[#8b939f] focus:border-[#3CB043] focus:ring-[#3CB043]/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="device"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4b5563]"
                      >
                        Device Model
                      </label>
                      <div className="relative">
                        <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                        <Input
                          id="device"
                          placeholder="e.g. iPhone 15 Pro"
                          className="h-12 rounded-xl border-[#d8e6db] bg-[#f7fbf8] pl-10 text-[15px] text-[#0f172a] placeholder:text-[#8b939f] focus:border-[#3CB043] focus:ring-[#3CB043]/20"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="issue"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4b5563]"
                      >
                        Issue Type
                      </label>
                      <div className="relative">
                        <Wrench className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                        <select
                          id="issue"
                          className="flex h-12 w-full appearance-none rounded-xl border border-[#d8e6db] bg-[#f7fbf8] px-10 py-2 text-sm text-[#0f172a] focus:border-[#3CB043] focus:outline-none focus:ring-1 focus:ring-[#3CB043]"
                          required
                        >
                          <option value="">Select an issue</option>
                          <option value="screen">Cracked Screen</option>
                          <option value="battery">Battery Replacement</option>
                          <option value="water">Water Damage</option>
                          <option value="charging">Charging Port</option>
                          <option value="camera">Camera Repair</option>
                          <option value="software">Software Issue</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4b5563]"
                    >
                      Describe the Issue
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about the problem with your device..."
                      className="min-h-[140px] rounded-xl border-[#d8e6db] bg-[#f7fbf8] text-[15px] text-[#0f172a] placeholder:text-[#8b939f] focus:border-[#3CB043] focus:ring-[#3CB043]/20 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full rounded-xl bg-[linear-gradient(135deg,#3CB043_0%,#2d8a34_100%)] px-8 text-base font-semibold text-white shadow-[0_16px_35px_-18px_rgba(45,138,52,0.8)] transition-all hover:brightness-110"
                    disabled={submitted}
                  >
                    {submitted ? (
                      "Quote Request Sent!"
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Request Free Quote
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div
            ref={infoRef}
            className={`transition-all duration-700 delay-200 ${
              infoVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-[30px] border border-[#1f3f2a] bg-[linear-gradient(165deg,#0a2316_0%,#103522_100%)] p-8 text-[#d2e7d8] shadow-[0_24px_60px_-35px_rgba(2,44,21,0.8)] lg:p-10">
              <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#3CB043]/18 blur-3xl" />
              <div className="relative">
                <h3 className="text-2xl font-bold text-[#f5fff7]">Talk to a Specialist</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#b9d3bf]">
                  Prefer to speak with someone now? Our repair team is online and ready to help.
                </p>

                <div className="mt-7 flex flex-col gap-3">
                  {contactInfo.map((info) => (
                    <a
                      key={info.label}
                      href={info.href}
                      className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:border-[#3CB043]/45 hover:bg-[#3CB043]/10"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3CB043]/12">
                        <info.icon className="h-5 w-5 text-[#79d07f]" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8eb596]">
                          {info.label}
                        </div>
                        <div className="mt-1 text-sm font-medium text-[#edf8f0] group-hover:text-[#9df5a5] transition-colors">
                          {info.value}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#95ba9c]">
                    Follow Us
                  </h4>
                  <div className="flex gap-3">
                    {["Facebook", "Instagram", "TikTok"].map((social) => (
                      <a
                        key={social}
                        href="#"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-bold text-[#c3dbc8] transition-all hover:border-[#3CB043]/45 hover:bg-[#3CB043]/15 hover:text-[#9df5a5]"
                        aria-label={social}
                      >
                        {social[0]}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-[#3CB043]/35 bg-[#3CB043]/12 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3CB043]/20">
                      <ArrowRight className="h-4 w-4 text-[#7ad37f]" />
                    </div>
                    <div className="text-xs leading-relaxed text-[#c8e0cd]">
                      <span className="font-semibold text-[#9df5a5]">Walk-ins welcome!</span>{" "}
                      No appointment needed for diagnostics.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
