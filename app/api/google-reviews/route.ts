import { NextResponse } from "next/server"
import { getGoogleReviews } from "@/lib/google-reviews-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const payload = await getGoogleReviews()
    return NextResponse.json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    console.error("[google-reviews] GET failed:", message)
    return NextResponse.json({ error: "Failed to load Google reviews", message }, { status: 502 })
  }
}
