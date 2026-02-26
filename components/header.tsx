"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Services", href: "#our-services" },
  { label: "About", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#visit-us" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHomeRoute = pathname === "/"
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
        <div className="bg-black text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-sm">
            <div className="flex items-center gap-6">
              <a
                href="tel:0403983009"
                className="flex items-center gap-2 transition-colors hover:text-[#ffffff]/80"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>0403983009</span>
              </a>
              <span className="hidden items-center gap-2 sm:flex">
                <MapPin className="h-3.5 w-3.5" />
                <span>27 Church St, Lidcombe, NSW 2141</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden font-medium md:block">
                Same Day Repairs Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/images/phone-garage-logo.jpg"
            alt="Phone Garage logo"
            className="h-12 w-auto lg:h-14"
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 lg:flex">
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
          isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border bg-background/95 backdrop-blur-md px-4 py-4">
          <div className="flex flex-col gap-3">
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
