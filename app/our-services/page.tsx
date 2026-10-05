import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OurServicesPage } from "@/components/pages/our-services-page"
import { bodyFont, displayFont } from "@/app/fonts"

export const metadata: Metadata = {
  title: "Our Services | Phone Garage Lidcombe",
  description:
    "Phone screen, laptop, water damage, OLED display, Apple Watch, iPad, data recovery, motherboard and PS4/PS5 console repairs in Lidcombe, NSW. Same-day repairs with a 6-month warranty.",
  alternates: {
    canonical: "/our-services",
  },
}

export default function OurServices() {
  return (
    <div className={`${bodyFont.variable} ${displayFont.variable} font-sans`}>
      <Header />
      <main className="relative z-10">
        <OurServicesPage />
      </main>
      <Footer />
    </div>
  )
}
