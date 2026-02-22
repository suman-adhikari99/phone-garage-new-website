import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminLoginPage } from "@/components/pages/admin-login-page"
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_SESSION_COOKIE_NAME,
  isAdminAuthenticatedFromSessionToken,
} from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: "Admin Login | Phone Garage",
  description: "Secure login for Phone Garage dashboard administrators.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLoginRoutePage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value || ""

  if (isAdminAuthenticatedFromSessionToken(sessionToken)) {
    redirect(ADMIN_DASHBOARD_PATH)
  }

  return <AdminLoginPage />
}
