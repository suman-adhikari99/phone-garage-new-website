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

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative z-10">
        <Hero />
        <ServicesPreview />
        <CommonPhoneRepairsSection backgroundTheme="white" />
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
