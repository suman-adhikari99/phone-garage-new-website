"use client"

export type GoogleReviewPayload = {
  authorName: string
  authorPhotoUrl: string
  rating: number
  text: string
  relativeDate: string
  publishedAt: string
}

export type GoogleReviewsApiResponse = {
  placeName: string
  rating: number | null
  reviewCount: number | null
  reviews: GoogleReviewPayload[]
}

const CLIENT_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 2

let cachedPayload: GoogleReviewsApiResponse | null = null
let cacheExpiresAt = 0
let inFlight: Promise<GoogleReviewsApiResponse | null> | null = null

function asSafeString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function asSafeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function normalizePayload(payload: unknown): GoogleReviewsApiResponse | null {
  if (!payload || typeof payload !== "object") return null
  const data = payload as Record<string, unknown>

  const placeName = asSafeString(data.placeName) || "Google Reviews"
  const rating = asSafeNumber(data.rating)
  const reviewCount = asSafeNumber(data.reviewCount)

  const reviews = Array.isArray(data.reviews)
    ? data.reviews
        .map((item) => {
          if (!item || typeof item !== "object") return null
          const review = item as Record<string, unknown>
          return {
            authorName: asSafeString(review.authorName),
            authorPhotoUrl: asSafeString(review.authorPhotoUrl),
            rating: asSafeNumber(review.rating) ?? 5,
            text: asSafeString(review.text),
            relativeDate: asSafeString(review.relativeDate),
            publishedAt: asSafeString(review.publishedAt),
          }
        })
        .filter((item): item is GoogleReviewPayload => Boolean(item))
    : []

  return {
    placeName,
    rating,
    reviewCount,
    reviews,
  }
}

async function fetchGoogleReviewsFromApi() {
  const response = await fetch("/api/google-reviews")
  if (!response.ok) return null

  const payload = await response.json().catch(() => null)
  return normalizePayload(payload)
}

export async function getCachedGoogleReviews() {
  const now = Date.now()
  if (cachedPayload && cacheExpiresAt > now) {
    return cachedPayload
  }

  if (inFlight) {
    return inFlight
  }

  inFlight = (async () => {
    const payload = await fetchGoogleReviewsFromApi().catch(() => null)
    if (payload) {
      cachedPayload = payload
      cacheExpiresAt = Date.now() + CLIENT_CACHE_TTL_MS
    }
    return payload
  })()

  try {
    return await inFlight
  } finally {
    inFlight = null
  }
}
