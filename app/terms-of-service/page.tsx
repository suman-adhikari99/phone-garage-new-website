import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Terms of Service | Phone Garage",
  description: "Read the service terms that apply to Phone Garage repairs, diagnostics, quotes, and warranties.",
}

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="relative z-10 pt-28 pb-64 sm:pt-32">
        <section className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm sm:p-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#3CB043]">
              Terms of Service
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
              Repair and booking terms
            </h1>
            <div className="mt-8 space-y-8 text-[15px] leading-7 text-[#4b5563]">
              <section>
                <h2 className="text-lg font-semibold text-[#0f172a]">Quotes and approvals</h2>
                <p className="mt-2">
                  Quotes are estimates based on the information available at the time. If further issues are discovered
                  during inspection, we will contact you before proceeding.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-[#0f172a]">Repair turnaround</h2>
                <p className="mt-2">
                  Many repairs are completed the same day, but turnaround times can vary depending on parts availability,
                  device condition, and repair complexity.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-[#0f172a]">Warranty</h2>
                <p className="mt-2">
                  Phone Garage provides a limited repair warranty on eligible work. Warranty coverage does not include
                  new accidental damage, liquid damage after repair, or unrelated faults.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-[#0f172a]">Customer responsibility</h2>
                <p className="mt-2">
                  Customers are responsible for removing passcodes where required for testing and for backing up important
                  data before handing over a device for service.
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
