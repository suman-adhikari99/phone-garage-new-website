"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X, Phone, MapPin, ChevronDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  LAPTOP_REPAIR_PATH,
  REPAIR_SERVICES_PATH,
  getRepairServicePageHref,
  repairServices,
} from "@/lib/repair-services"

const menuServices = repairServices.filter((service) => service.page !== LAPTOP_REPAIR_PATH)

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#visit-us" },
]

function ServicesDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const open = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setIsOpen(true)
  }

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setIsOpen(false), 140)
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [])

  return (
    <div
      className="flex self-stretch items-center"
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      onFocus={open}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          scheduleClose()
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false)
      }}
    >
      <a
        href={REPAIR_SERVICES_PATH}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="group flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
      >
        Services
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
        />
      </a>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full z-50 w-[min(860px,calc(100vw-2rem))] -translate-x-1/2 pt-2"
          >
            <div className="grid overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl md:grid-cols-[1fr_230px]">
              <ul className="grid gap-1 p-3 sm:grid-cols-2">
                {menuServices.map((service, index) => (
                  <motion.li
                    key={service.slug}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.025 * index, duration: 0.25 }}
                  >
                    <a
                      href={getRepairServicePageHref(service)}
                      onClick={() => setIsOpen(false)}
                      className="group/item flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-zinc-50"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-all duration-300 group-hover/item:border-primary group-hover/item:bg-primary group-hover/item:text-white">
                        <service.icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-snug text-zinc-900">
                          {service.menuLabel}
                        </span>
                        <span className="block truncate text-xs text-zinc-500">
                          {service.tagline}
                        </span>
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>

              <a
                href={REPAIR_SERVICES_PATH}
                onClick={() => setIsOpen(false)}
                className="group/feature relative hidden min-h-full overflow-hidden bg-zinc-950 md:block"
              >
                <img
                  src="/images/services/hero-workshop.jpg"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover/feature:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <span className="relative flex h-full flex-col justify-end p-5 text-white">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                    10 specialties
                  </span>
                  <span className="mt-2 text-lg font-semibold leading-snug">
                    Repaired by hand, right here in Lidcombe.
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                    Explore all services
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/feature:translate-x-1" />
                  </span>
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false)
  const pathname = usePathname()
  const isHomeRoute = pathname === "/"
  const isLaptopRoute = pathname === LAPTOP_REPAIR_PATH
  const getNavHref = (href: string) => {
    if (href.startsWith("#")) {
      return isHomeRoute ? href : `/${href}`
    }
    return href
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      {/* Top bar */}
      <div
        className={`overflow-hidden transition-all duration-500 ${
          isScrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <div className="group/ticker bg-black text-sm text-[#3CB043]">
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="flex w-max animate-marquee py-2 group-hover/ticker:[animation-play-state:paused] motion-reduce:animate-none">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1 || undefined}
                className="flex shrink-0 items-center"
              >
                {[0, 1, 2].map((repeat) => (
                  <div key={repeat} className="flex shrink-0 items-center gap-10 pr-10">
                    <a
                      href="tel:0403983009"
                      tabIndex={copy === 1 || repeat > 0 ? -1 : undefined}
                      className="flex items-center gap-2 font-medium transition-colors hover:text-white"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>0403983009</span>
                    </a>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>27 Church St, Lidcombe, NSW 2141</span>
                    </span>
                    <span className="flex items-center gap-2 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3CB043]" />
                      Same Day Repairs Available
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/images/phone-garage-logo.png"
            alt="Phone Garage logo"
            className="h-12 w-auto lg:h-14"
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 lg:flex">
          <ServicesDropdown />
          <a
            href={LAPTOP_REPAIR_PATH}
            aria-current={isLaptopRoute ? "page" : undefined}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isLaptopRoute ? "text-primary" : "text-foreground"
            }`}
          >
            Laptop Repair
          </a>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={getNavHref(link.href)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? "text-foreground" : "text-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            variant="outline"
            size="sm"
            className="border-black text-black hover:bg-black hover:text-white bg-transparent"
            asChild
          >
            <a href="tel:0403983009">
              <Phone className="mr-2 h-4 w-4" />
              Call Now
            </a>
          </Button>
          <Button
            size="sm"
            className="bg-[rgba(21,33,21,1)] text-primary-foreground hover:bg-[rgba(28,44,28,1)]"
            asChild
          >
            <a href="/quote">Get a quote</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 transition-colors hover:bg-muted lg:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${
          isMobileMenuOpen ? "max-h-[85vh] overflow-y-auto opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border bg-background/95 backdrop-blur-md px-4 py-4">
          <div className="flex flex-col gap-3">
            <div>
              <button
                type="button"
                onClick={() => setIsMobileServicesOpen((value) => !value)}
                aria-expanded={isMobileServicesOpen}
                className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Services
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isMobileServicesOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  isMobileServicesOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <ul className="overflow-hidden">
                  {menuServices.map((service) => (
                    <li key={service.slug}>
                      <a
                        href={getRepairServicePageHref(service)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <service.icon className="h-4 w-4 text-primary" />
                        {service.menuLabel}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href={REPAIR_SERVICES_PATH}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary"
                    >
                      Explore all services
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <a
              href={LAPTOP_REPAIR_PATH}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isLaptopRoute ? "page" : undefined}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${
                isLaptopRoute ? "text-primary" : "text-foreground"
              }`}
            >
              Laptop Repair
            </a>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={getNavHref(link.href)}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white w-full bg-transparent"
                asChild
              >
                <a href="tel:0403983009">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </a>
              </Button>
              <Button
                className="bg-[rgba(21,33,21,1)] text-primary-foreground hover:bg-[rgba(28,44,28,1)] w-full"
                asChild
              >
                <a href="/quote">Get a quote</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
