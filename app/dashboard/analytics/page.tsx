import type { Metadata } from "next"
import { DashboardAnalyticsPage } from "@/components/pages/dashboard/analytics-page"

export const metadata: Metadata = {
  title: "Dashboard Analytics | Phone Garage",
  description: "Track trends, status distribution, and issue patterns.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardAnalyticsRoutePage() {
  return <DashboardAnalyticsPage />
}
