import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Contact } from "@/components/contact"

export const metadata: Metadata = {
  title: "Get a Quote",
  description: "Tell us about your device and get a tailored repair quote.",
}

export default function QuotePage() {
  return (
    <>
      <Header />
      <main className="relative z-10 pt-28 sm:pt-32">
        <Contact />
      </main>
    </>
  )
}
