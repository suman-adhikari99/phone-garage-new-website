import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    message: "Logged out.",
  })

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  return response
}
