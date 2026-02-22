import { NextResponse } from "next/server"
import {
  adminSessionCookieOptions,
  createAdminSessionToken,
  isValidAdminCredentials,
} from "@/lib/admin-auth"

export const runtime = "nodejs"

type LoginBody = {
  username?: unknown
  password?: unknown
}

function asTrimmedString(value: unknown) {
  if (typeof value !== "string") return ""
  return value.trim()
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as LoginBody | null
    const username = asTrimmedString(body?.username)
    const password = asTrimmedString(body?.password)

    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
          message: "Username and password are required.",
        },
        { status: 400 }
      )
    }

    if (!isValidAdminCredentials(username, password)) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid username or password.",
        },
        { status: 401 }
      )
    }

    const token = createAdminSessionToken()
    const response = NextResponse.json({
      ok: true,
      message: "Login successful.",
    })

    response.cookies.set({
      name: "pg_admin_session",
      value: token,
      ...adminSessionCookieOptions,
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json(
      {
        error: "Login failed",
        message,
      },
      { status: 500 }
    )
  }
}
