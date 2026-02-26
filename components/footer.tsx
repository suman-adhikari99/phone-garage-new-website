"use client"

import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react"

const footerLinks = {
  Services: [
    "Screen Replacement",
    "Battery Replacement",
    "Water Damage Repair",
    "Camera Repair",
    "Charging Port Repair",
    "Data Recovery",
  ],
  "Quick Links": [
    { label: "About Us", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "/quote" },
  ],
  Brands: [
    "Apple iPhone",
    "Samsung Galaxy",
    "Google Pixel",
    "Huawei",
    "OPPO",
    "OnePlus",
  ],
}

export function Footer() {
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
            <img
              src="/images/phone-garage-logo.jpg"
              alt="Phone Garage logo"
              className="mb-4 h-10 w-auto"
            />
            <p className="mb-6 text-lg leading-relaxed">
              Your trusted mobile phone repair specialists in Australia.
              Professional repairs with warranty on all services.
            </p>
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
              <span className="flex items-center gap-2 text-lg">
                <MapPin className="h-4 w-4 text-[#3CB043]" />
                Sydney, NSW, Australia
              </span>
            </div>

          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-lg font-semibold uppercase tracking-wider text-[#0f172a]">
              Services
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.Services.map((service) => (
                <li key={service}>
                  <a
                    href="#services"
                    className="text-lg hover:text-[#3CB043] transition-colors"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold uppercase tracking-wider text-[#0f172a]">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks["Quick Links"].map((link) => (
                <li key={typeof link === "string" ? link : link.label}>
                  <a
                    href={typeof link === "string" ? "#" : link.href}
                    className="text-lg hover:text-[#3CB043] transition-colors"
                  >
                    {typeof link === "string" ? link : link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="mb-4 text-lg font-semibold uppercase tracking-wider text-[#0f172a]">
              Brands We Repair
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.Brands.map((brand) => (
                <li key={brand}>
                  <span className="text-lg">{brand}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#e5e7eb] py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-base sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()} Phone Garage. All rights
              reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="hover:text-[#3CB043] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-[#3CB043] transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
