import type { Metadata } from "next"
import { Suspense } from "react"
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
        <Suspense
          fallback={
            <div className="mx-auto max-w-4xl px-4 py-12 text-sm font-medium text-zinc-600 sm:px-6 lg:px-8">
              Loading your booking confirmation...
            </div>
          }
        >
          <BookingSuccessPage />
        </Suspense>
      </main>
    </>
  )
}
