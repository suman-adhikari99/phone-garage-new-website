import type { Metadata } from "next"
import { DashboardOverviewPage } from "@/components/pages/dashboard/overview-page"

export const metadata: Metadata = {
  title: "Dashboard Overview | Phone Garage",
  description:
    "Admin overview for customer quotes and repair booking operations.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardPage() {
  return <DashboardOverviewPage />
}
