import type { Metadata } from "next"
import { ServicesPage } from "../../components/pages/services-page"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "Repair Services",
  description: "Browse our complete range of mobile repair services including screen repair, battery replacement, camera repair, and more.",
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
