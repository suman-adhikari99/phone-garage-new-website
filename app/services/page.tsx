import type { Metadata } from "next"
import { ServicesPage } from "../../components/pages/services-page"
import { Header } from "@/components/header"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

const servicesDescription =
  "Browse Phone Garage repair services in Lidcombe, including screen repair, battery replacement, camera repair, laptop repair and more."

export const metadata: Metadata = {
  title: "Repair Services | Phone Garage Lidcombe",
  description: servicesDescription,
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Repair Services | Phone Garage Lidcombe",
    description: servicesDescription,
    url: "/services",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Repair Services | Phone Garage Lidcombe",
    description: servicesDescription,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function Services() {
  return (
    <>
      <Header />
      <main className="relative z-10 pt-28 sm:pt-32">
        <ServicesPage />
      </main>
    </>
  )
}
