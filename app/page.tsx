import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ServicesPreview } from "@/components/home/services-preview"
import { CommonPhoneRepairsSection } from "@/components/common-phone-repairs"
import { Stats } from "@/components/stats"
import { About } from "@/components/about"
import { Process } from "@/components/process"
import { Testimonials } from "@/components/testimonials"
import { CTABanner } from "@/components/cta-banner"
import { FAQ } from "@/components/faq"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServicesPreview />
        <CommonPhoneRepairsSection backgroundTheme="white" />
        <Stats />
        <About />
        <Process />
        <Testimonials />
        <CTABanner />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
