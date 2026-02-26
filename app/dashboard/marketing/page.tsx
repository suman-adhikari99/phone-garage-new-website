import type { Metadata } from "next"
import { DashboardMarketingPage } from "@/components/pages/dashboard/marketing-page"

export const metadata: Metadata = {
  title: "Dashboard Marketing | Phone Garage",
  description: "Send offer and announcement email campaigns to customer contacts.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardMarketingRoutePage() {
  return <DashboardMarketingPage />
}
