import type { Metadata } from "next"
import { BookRepairPage } from "../../components/pages/book-repair-page"

export const metadata: Metadata = {
  title: "Book a Repair",
  description: "Book your mobile repair online. Select your device, choose a service, and pick a convenient time. Same-day repairs available.",
}

export default function BookRepair() {
  return <BookRepairPage />
}
