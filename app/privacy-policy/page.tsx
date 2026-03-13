import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Privacy Policy | Phone Garage",
  description: "Learn how Phone Garage handles personal information, repair enquiries, and customer communications.",
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="relative z-10 pt-28 pb-64 sm:pt-32">
        <section className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm sm:p-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#3CB043]">
              Privacy Policy
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
              How we handle your information
            </h1>
            <div className="mt-8 space-y-8 text-[15px] leading-7 text-[#4b5563]">
              <section>
                <h2 className="text-lg font-semibold text-[#0f172a]">What we collect</h2>
                <p className="mt-2">
                  When you request a quote, book a repair, or contact Phone Garage, we may collect details such as your
                  name, phone number, email address, device information, and repair request details.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-[#0f172a]">How we use it</h2>
                <p className="mt-2">
                  We use this information to respond to enquiries, manage bookings, communicate about repairs, send
                  quotes, and improve customer support. We do not sell your personal information.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-[#0f172a]">Device privacy</h2>
                <p className="mt-2">
                  We treat customer devices and data with care. Even so, customers should back up important data before
                  repair whenever possible.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-[#0f172a]">Contact</h2>
                <p className="mt-2">
                  If you have privacy questions, contact us at{" "}
                  <a className="text-[#3CB043] hover:underline" href="mailto:info@phonegarage.com.au">
                    info@phonegarage.com.au
                  </a>{" "}
                  or call{" "}
                  <a className="text-[#3CB043] hover:underline" href="tel:0403983009">
                    0403983009
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
