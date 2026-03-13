"use client"

import Link from "next/link"
import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react"
import { stores } from "@/lib/data"

const footerLinks = {
  Services: [
    { label: "Screen Replacement", href: "/services/screen-repair" },
    { label: "Battery Replacement", href: "/services/battery-replacement" },
    { label: "Water Damage Repair", href: "/services/water-damage" },
    { label: "Camera Repair", href: "/services/camera-repair" },
    { label: "Charging Port Repair", href: "/services/charging-port" },
    { label: "Data Recovery", href: "/services/data-recovery" },
  ],
  "Quick Links": [
    { label: "About Us", href: "/#about" },
    { label: "Services", href: "/services" },
    { label: "Testimonials", href: "/#testimonials" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/quote" },
  ],
  Brands: [
    { label: "Apple iPhone", href: "/brands/apple" },
    { label: "Samsung Galaxy", href: "/brands/samsung" },
    { label: "Google Pixel", href: "/brands/google" },
    { label: "Huawei", href: "/brands/huawei" },
    { label: "OPPO", href: "/brands/oppo" },
    { label: "OnePlus", href: "/brands/oneplus" },
  ],
}

export function Footer() {
  const primaryStore = stores[0]
  const mapHref = primaryStore
    ? primaryStore.mapUrl.replace("&output=embed", "")
    : "https://www.google.com/maps?q=Sydney+NSW+Australia"

  return (
    <footer
      id="site-footer"
      className="fixed inset-x-0 bottom-0 z-0 bg-white text-[#4b5563]"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Main footer */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <img
                src="/images/phone-garage-logo.jpg"
                alt="Phone Garage logo"
                className="mb-4 h-10 w-auto"
              />
            </Link>
            <Link
              href="/#about"
              className="mb-6 block text-lg leading-relaxed transition-colors hover:text-[#3CB043]"
            >
              Your trusted mobile phone repair specialists in Australia.
              Professional repairs with warranty on all services.
            </Link>
            <div className="flex flex-col gap-3">
              <a
                href="tel:0403983009"
                className="flex items-center gap-2 text-lg hover:text-[#3CB043] transition-colors"
              >
                <Phone className="h-4 w-4 text-[#3CB043]" />
                0403983009
              </a>
              <a
                href="mailto:info@phonegarage.com.au"
                className="flex items-center gap-2 text-lg hover:text-[#3CB043] transition-colors"
              >
                <Mail className="h-4 w-4 text-[#3CB043]" />
                info@phonegarage.com.au
              </a>
              <a
                href={mapHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-lg hover:text-[#3CB043] transition-colors"
              >
                <MapPin className="h-4 w-4 text-[#3CB043]" />
                Sydney, NSW, Australia
              </a>
            </div>

          </div>

          {/* Services */}
          <div>
            <Link
              href="/services"
              className="mb-4 inline-block text-lg font-semibold uppercase tracking-wider text-[#0f172a] transition-colors hover:text-[#3CB043]"
            >
              Services
            </Link>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.Services.map((service) => (
                <li key={service.label}>
                  <Link
                    href={service.href}
                    className="text-lg hover:text-[#3CB043] transition-colors"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <Link
              href="/"
              className="mb-4 inline-block text-lg font-semibold uppercase tracking-wider text-[#0f172a] transition-colors hover:text-[#3CB043]"
            >
              Quick Links
            </Link>
            <ul className="flex flex-col gap-2.5">
              {footerLinks["Quick Links"].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-lg hover:text-[#3CB043] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <Link
              href="/book"
              className="mb-4 inline-block text-lg font-semibold uppercase tracking-wider text-[#0f172a] transition-colors hover:text-[#3CB043]"
            >
              Brands We Repair
            </Link>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.Brands.map((brand) => (
                <li key={brand.label}>
                  <Link
                    href={brand.href}
                    className="text-lg hover:text-[#3CB043] transition-colors"
                  >
                    {brand.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#e5e7eb] py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-base sm:flex-row">
            <Link
              href="/"
              className="transition-colors hover:text-[#3CB043]"
            >
              &copy; {new Date().getFullYear()} Phone Garage. All rights
              reserved.
            </Link>
            <div className="flex gap-6">
              <Link
                href="/privacy-policy"
                className="hover:text-[#3CB043] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-[#3CB043] transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
