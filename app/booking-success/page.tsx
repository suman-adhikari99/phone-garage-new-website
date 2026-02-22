import type { Metadata } from "next"
import { Header } from "@/components/header"
import { BookingSuccessPage } from "@/components/pages/booking-success-page"

export const metadata: Metadata = {
  title: "Booking Submitted",
  description:
    "Your booking request has been submitted successfully. View your reference number and booking details.",
}

export default function BookingSuccess() {
  return (
    <>
      <Header />
      <main className="relative z-10 pt-28 sm:pt-32">
        <BookingSuccessPage />
      </main>
    </>
  )
}
