import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Contact } from "@/components/contact"
import { bodyFont, displayFont } from "@/app/fonts"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

const quoteDescription =
  "Tell us about your phone, tablet, laptop, watch or console and get a free repair quote from Phone Garage in Lidcombe, NSW."

export const metadata: Metadata = {
  title: "Get a Free Quote | Phone Garage Lidcombe",
  description: quoteDescription,
  alternates: {
    canonical: "/quote",
  },
  openGraph: {
    title: "Get a Free Quote | Phone Garage Lidcombe",
    description: quoteDescription,
    url: "/quote",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get a Free Quote | Phone Garage Lidcombe",
    description: quoteDescription,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function QuotePage() {
  return (
    <div className={`${bodyFont.variable} ${displayFont.variable} min-h-screen bg-[#f5f3ef] font-sans`}>
      <Header />
      <main className="relative z-10 pt-32 sm:pt-36">
        <Contact />
      </main>
    </div>
  )
}
