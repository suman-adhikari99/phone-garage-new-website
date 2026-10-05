import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LaptopRepairPage } from "@/components/pages/laptop-repair-page"
import { laptopRepairFaqs } from "@/lib/laptop-repair-faqs"
import { BUSINESS_ADDRESS, BUSINESS_NAME, BUSINESS_PHONE, LAPTOP_OG_IMAGE } from "@/lib/seo"
import { toAbsoluteUrl } from "@/lib/site-url"

/** Matches the home page, which renders in the platform system font. */
const HOME_FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'

export const metadata: Metadata = {
  title: "Laptop Repair Lidcombe — All Brands | Phone Garage",
  description:
    "MacBook, Dell, HP, Lenovo, ASUS, Acer, MSI, Surface and every other laptop brand repaired in Lidcombe, NSW. Screens, keyboards, batteries, hinges and board repairs. Free diagnosis, 6-month warranty.",
  alternates: {
    canonical: "/laptop-repair",
  },
  openGraph: {
    title: "Laptop Repair Lidcombe — All Brands | Phone Garage",
    description:
      "MacBook, Windows laptop, Chromebook and gaming laptop repairs in Lidcombe, NSW. Free diagnosis and 6-month repair warranty.",
    url: "/laptop-repair",
    type: "website",
    images: [LAPTOP_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laptop Repair Lidcombe — All Brands | Phone Garage",
    description:
      "MacBook, Windows laptop, Chromebook and gaming laptop repairs in Lidcombe, NSW. Free diagnosis and 6-month repair warranty.",
    images: [LAPTOP_OG_IMAGE.url],
  },
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Laptop repair",
    name: "Laptop Repair — All Brands",
    url: toAbsoluteUrl("/laptop-repair"),
    areaServed: "Lidcombe, NSW",
    provider: {
      "@type": "LocalBusiness",
      name: BUSINESS_NAME,
      telephone: BUSINESS_PHONE,
      address: {
        "@type": "PostalAddress",
        ...BUSINESS_ADDRESS,
      },
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: laptopRepairFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  },
]

export default function LaptopRepair() {
  return (
    <div style={{ fontFamily: HOME_FONT_STACK }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Header />
      <main className="relative z-10">
        <LaptopRepairPage />
      </main>
      <Footer />
    </div>
  )
}
