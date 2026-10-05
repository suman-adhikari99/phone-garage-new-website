import type { Metadata } from "next"
import { BookRepairPage } from "../../components/pages/book-repair-page"
import { Header } from "@/components/header"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

const bookDescription =
  "Book your mobile, tablet or laptop repair online with Phone Garage Lidcombe. Select your device, choose a service and request same-day repair."

export const metadata: Metadata = {
  title: "Book a Repair | Phone Garage Lidcombe",
  description: bookDescription,
  alternates: {
    canonical: "/book",
  },
  openGraph: {
    title: "Book a Repair | Phone Garage Lidcombe",
    description: bookDescription,
    url: "/book",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Repair | Phone Garage Lidcombe",
    description: bookDescription,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function BookRepair() {
  return (
    <>
      <Header />
      <main className="relative z-10 pt-28 sm:pt-32">
        <BookRepairPage />
      </main>
    </>
  )
}
