import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ServicesPreview } from "@/components/home/services-preview"
import { CommonPhoneRepairsSection } from "@/components/common-phone-repairs"
import { Stats } from "@/components/stats"
import { About } from "@/components/about"
import { Testimonials } from "@/components/testimonials"
import { CTABanner } from "@/components/cta-banner"
import { ShopLocationShowcase } from "@/components/shop-location-showcase"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"
import { LaptopRepairCloneSection } from "@/components/laptop-repair-clone"
import { DEFAULT_OG_IMAGE, localBusinessStructuredData } from "@/lib/seo"

const homeDescription =
  "Phone Garage repairs phones, tablets, laptops, watches and consoles in Lidcombe, NSW. Same-day service, free diagnosis and repair warranty."

export const metadata: Metadata = {
  title: "Phone Garage Lidcombe | Phone, Tablet & Laptop Repairs",
  description: homeDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Phone Garage Lidcombe | Phone, Tablet & Laptop Repairs",
    description: homeDescription,
    url: "/",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phone Garage Lidcombe | Phone, Tablet & Laptop Repairs",
    description: homeDescription,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessStructuredData()) }}
      />
      <Header />
      <main className="relative z-10">
        <Hero />
        <ServicesPreview />
        <CommonPhoneRepairsSection backgroundTheme="white" />
        <LaptopRepairCloneSection />
        <Stats />
        <About />
        <Testimonials />
        <CTABanner />
        <ShopLocationShowcase />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
