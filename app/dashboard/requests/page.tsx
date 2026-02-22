import type { Metadata } from "next"
import { DashboardRequestsPage } from "@/components/pages/dashboard/requests-page"

export const metadata: Metadata = {
  title: "Dashboard Requests | Phone Garage",
  description: "Manage customer quote and booking requests in one queue.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardRequestsRoutePage() {
  return <DashboardRequestsPage />
}
