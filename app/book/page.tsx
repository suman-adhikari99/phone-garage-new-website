import type { Metadata } from "next"
import { BookRepairPage } from "../../components/pages/book-repair-page"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "Book a Repair",
  description: "Book your mobile repair online. Select your device, choose a service, and pick a convenient time. Same-day repairs available.",
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
