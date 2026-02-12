import type { Metadata } from "next"
import { ServicesPage } from "../../components/pages/services-page"

export const metadata: Metadata = {
  title: "Repair Services",
  description: "Browse our complete range of mobile repair services including screen repair, battery replacement, camera repair, and more.",
}

export default function Services() {
  return <ServicesPage />
}
