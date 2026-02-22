import { NextResponse } from "next/server"
import { getGoogleReviews } from "@/lib/google-reviews-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isAuthorized(request: Request) {
  const requiredSecret = process.env.GOOGLE_REVIEWS_SYNC_SECRET?.trim()
  if (!requiredSecret) return true

  const providedFromHeader = request.headers.get("x-sync-secret")?.trim()
  if (providedFromHeader && providedFromHeader === requiredSecret) return true

  const url = new URL(request.url)
  const providedFromQuery = url.searchParams.get("secret")?.trim()
  if (providedFromQuery && providedFromQuery === requiredSecret) return true

  return false
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await getGoogleReviews({ forceRefresh: true })
    return NextResponse.json({
      ok: true,
      source: payload.source,
      stale: payload.stale,
      fetchedAt: payload.fetchedAt,
      placeId: payload.placeId,
      placeName: payload.placeName,
      reviewCount: payload.reviews.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    console.error("[google-reviews] sync failed:", message)
    return NextResponse.json({ error: "Failed to sync Google reviews", message }, { status: 502 })
  }
}
