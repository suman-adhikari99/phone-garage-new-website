"use client"

import React from "react"

import { useState } from "react"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ArrowRight,
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

export function Contact() {
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation()
  const { ref: infoRef, isVisible: infoVisible } = useScrollAnimation()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section id="contact" className="relative bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-20">
          {/* Left - Contact form */}
          <div
            ref={formRef}
            className={`flex-1 transition-all duration-700 ${
              formVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-12 opacity-0"
            }`}
          >
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Contact Us
            </span>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Get a <span className="text-primary">Free Quote</span>
            </h2>
            <p className="mb-8 text-muted-foreground leading-relaxed">
              Tell us about your device and the issue. We will get back to you
              with a quote within minutes.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    className="bg-card border-border focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0400 000 000"
                    className="bg-card border-border focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="bg-card border-border focus:border-primary"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="device"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Device Model
                  </label>
                  <Input
                    id="device"
                    placeholder="e.g. iPhone 15 Pro"
                    className="bg-card border-border focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="issue"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Issue Type
                  </label>
                  <select
                    id="issue"
                    className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Describe the Issue
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about the problem with your device..."
                  className="min-h-[120px] bg-card border-border focus:border-primary resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-[#2d8a34] w-full sm:w-auto px-8 font-semibold shadow-lg shadow-primary/20"
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

          {/* Right - Contact info */}
          <div
            ref={infoRef}
            className={`lg:w-[400px] transition-all duration-700 delay-200 ${
              infoVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-12 opacity-0"
            }`}
          >
            <div className="rounded-2xl bg-[#0a0a0a] p-8 lg:p-10">
              <h3 className="mb-6 text-xl font-bold text-[#f8f9fa]">
                Get in Touch
              </h3>

              <div className="flex flex-col gap-6">
                {contactInfo.map((info) => (
                  <a
                    key={info.label}
                    href={info.href}
                    className="group flex items-start gap-4 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3CB043]/10">
                      <info.icon className="h-5 w-5 text-[#3CB043]" />
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider text-[#6b7280]">
                        {info.label}
                      </div>
                      <div className="text-sm font-medium text-[#f8f9fa] group-hover:text-[#3CB043] transition-colors">
                        {info.value}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-8 border-t border-[#1f1f1f] pt-8">
                <h4 className="mb-4 text-sm font-semibold text-[#f8f9fa]">
                  Follow Us
                </h4>
                <div className="flex gap-3">
                  {["Facebook", "Instagram", "TikTok"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f1f] text-xs font-bold text-[#9ca3af] transition-all hover:bg-[#3CB043]/10 hover:text-[#3CB043]"
                      aria-label={social}
                    >
                      {social[0]}
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-[#3CB043]/10 border border-[#3CB043]/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3CB043]/20">
                    <ArrowRight className="h-4 w-4 text-[#3CB043]" />
                  </div>
                  <div className="text-xs text-[#9ca3af]">
                    <span className="font-semibold text-[#3CB043]">
                      Walk-ins welcome!
                    </span>{" "}
                    No appointment needed.
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
