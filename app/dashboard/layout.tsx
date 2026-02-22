import { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/pages/dashboard/dashboard-shell"
import {
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE_NAME,
  isAdminAuthenticatedFromSessionToken,
} from "@/lib/admin-auth"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value || ""

  if (!isAdminAuthenticatedFromSessionToken(sessionToken)) {
    redirect(ADMIN_LOGIN_PATH)
  }

  return <DashboardShell>{children}</DashboardShell>
}
