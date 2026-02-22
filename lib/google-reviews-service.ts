import {
  getGoogleReviewsSnapshot,
  saveGoogleReviewsSnapshot,
  type GoogleReviewRecord,
  type GoogleReviewsSnapshot,
} from "@/lib/google-reviews-store"

const GOOGLE_PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places"
const GOOGLE_PLACE_DETAILS_LEGACY_URL = "https://maps.googleapis.com/maps/api/place/details/json"
const GOOGLE_BUSINESS_PROFILE_BASE_URL = "https://mybusiness.googleapis.com/v4"
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"
const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours

export type GoogleReviewsApiPayload = GoogleReviewsSnapshot & {
  source: "database" | "google"
  stale: boolean
}

function toNumberOrNull(value: unknown) {
  if (typeof value !== "number") return null
  return Number.isFinite(value) ? value : null
}

function mapReview(review: any): GoogleReviewRecord | null {
  const authorName = review?.authorAttribution?.displayName || "Google User"
  const authorPhotoUrl = review?.authorAttribution?.photoUri || ""
  const rating = Number(review?.rating || 0)
  const text = review?.text?.text || review?.originalText?.text || ""
  const relativeDate = review?.relativePublishTimeDescription || ""
  const publishedAt = review?.publishTime || ""

  if (!text) return null

  return {
    authorName,
    authorPhotoUrl,
    rating: Number.isFinite(rating) ? rating : 0,
    text,
    relativeDate,
    publishedAt,
  }
}

function mapLegacyReview(review: any): GoogleReviewRecord | null {
  const authorName = review?.author_name || "Google User"
  const authorPhotoUrl = review?.profile_photo_url || ""
  const rating = Number(review?.rating || 0)
  const text = review?.text || ""
  const relativeDate = review?.relative_time_description || ""
  const publishedAt =
    typeof review?.time === "number" && Number.isFinite(review.time)
      ? new Date(review.time * 1000).toISOString()
      : ""

  if (!text) return null

  return {
    authorName,
    authorPhotoUrl,
    rating: Number.isFinite(rating) ? rating : 0,
    text,
    relativeDate,
    publishedAt,
  }
}

function starRatingToNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(5, Math.max(0, value))
  }

  if (typeof value !== "string") return 0
  const normalized = value.trim().toUpperCase()
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  }
  return map[normalized] ?? 0
}

function mapBusinessProfileReview(review: any): GoogleReviewRecord | null {
  const authorName = review?.reviewer?.displayName || "Google User"
  const authorPhotoUrl = review?.reviewer?.profilePhotoUrl || ""
  const rating = starRatingToNumber(review?.starRating)
  const text = (review?.comment || "").trim() || "(Rating-only review)"
  const publishedAt = review?.updateTime || review?.createTime || ""

  return {
    authorName,
    authorPhotoUrl,
    rating,
    text,
    relativeDate: "",
    publishedAt,
  }
}

function getCacheTtlMs() {
  const raw = process.env.GOOGLE_REVIEWS_CACHE_TTL_MS
  if (!raw) return DEFAULT_CACHE_TTL_MS
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_CACHE_TTL_MS
  return parsed
}

function isFresh(snapshot: GoogleReviewsSnapshot, maxAgeMs: number) {
  return Date.now() - snapshot.fetchedAt <= maxAgeMs
}

function getBusinessProfileLocationName() {
  const value = process.env.GOOGLE_BUSINESS_LOCATION_NAME?.trim()
  return value || null
}

function getConfiguredPlaceId() {
  const placeId = process.env.GOOGLE_PLACE_ID?.trim()
  if (!placeId) {
    throw new Error("Missing GOOGLE_PLACE_ID. Set a fixed place id in .env.local.")
  }
  return placeId
}

async function getBusinessProfileAccessToken() {
  const directAccessToken = process.env.GOOGLE_BUSINESS_ACCESS_TOKEN?.trim()
  if (directAccessToken) return directAccessToken

  const refreshToken = process.env.GOOGLE_BUSINESS_REFRESH_TOKEN?.trim()
  const clientId =
    process.env.GOOGLE_BUSINESS_CLIENT_ID?.trim() || process.env.GOOGLE_OAUTH_CLIENT_ID?.trim()
  const clientSecret =
    process.env.GOOGLE_BUSINESS_CLIENT_SECRET?.trim() || process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim()

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error(
      "Business Profile mode requires GOOGLE_BUSINESS_ACCESS_TOKEN or GOOGLE_BUSINESS_REFRESH_TOKEN + GOOGLE_BUSINESS_CLIENT_ID + GOOGLE_BUSINESS_CLIENT_SECRET."
    )
  }

  const tokenRes = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  })

  if (!tokenRes.ok) {
    const body = await tokenRes.text()
    throw new Error(`OAuth token refresh failed: status=${tokenRes.status} body=${body.slice(0, 260)}`)
  }

  const tokenData = await tokenRes.json()
  const token = tokenData?.access_token
  if (!token || typeof token !== "string") {
    throw new Error("OAuth token refresh succeeded but access_token missing.")
  }

  return token
}

async function fetchFromBusinessProfile(): Promise<Omit<GoogleReviewsSnapshot, "fetchedAt">> {
  const locationName = getBusinessProfileLocationName()
  if (!locationName) {
    throw new Error("Missing GOOGLE_BUSINESS_LOCATION_NAME.")
  }

  const accessToken = await getBusinessProfileAccessToken()
  const collected: GoogleReviewRecord[] = []
  let pageToken = ""
  let totalReviewCount: number | null = null
  let averageRating: number | null = null
  let safetyCounter = 0

  while (true) {
    safetyCounter += 1
    if (safetyCounter > 30) {
      throw new Error("Business Profile pagination exceeded safety limit.")
    }

    const url = new URL(`${GOOGLE_BUSINESS_PROFILE_BASE_URL}/${locationName}/reviews`)
    url.searchParams.set("pageSize", "50")
    url.searchParams.set("orderBy", "updateTime desc")
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken)
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Business Profile reviews fetch failed: status=${res.status} body=${body.slice(0, 260)}`)
    }

    const data = await res.json()
    const pageReviews = Array.isArray(data?.reviews) ? data.reviews : []
    const mapped = pageReviews
      .map(mapBusinessProfileReview)
      .filter((review: GoogleReviewRecord | null): review is GoogleReviewRecord => review !== null)

    collected.push(...mapped)

    if (typeof data?.totalReviewCount === "number") {
      totalReviewCount = data.totalReviewCount
    }
    if (typeof data?.averageRating === "number") {
      averageRating = data.averageRating
    }

    const nextToken = data?.nextPageToken
    if (!nextToken || typeof nextToken !== "string") {
      break
    }
    pageToken = nextToken
  }

  if (collected.length === 0) {
    throw new Error("Business Profile returned no reviews.")
  }

  return {
    placeId: locationName,
    placeName: process.env.GOOGLE_BUSINESS_LOCATION_LABEL?.trim() || "Google Business Profile",
    rating: averageRating,
    reviewCount: totalReviewCount ?? collected.length,
    reviews: collected,
  }
}

async function fetchPlaceDetailsNewApi(apiKey: string, placeId: string) {
  const detailsUrl = new URL(`${GOOGLE_PLACE_DETAILS_URL}/${placeId}`)
  detailsUrl.searchParams.set("fields", "displayName,rating,userRatingCount,reviews")

  const res = await fetch(detailsUrl.toString(), {
    headers: {
      "X-Goog-Api-Key": apiKey,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(`Places API (New) details failed: ${message}`)
  }

  const data = await res.json()
  const reviews = (data?.reviews || [])
    .map(mapReview)
    .filter((review: GoogleReviewRecord | null): review is GoogleReviewRecord => review !== null)

  return {
    placeId: data?.id || placeId,
    placeName: data?.displayName?.text || "Google Business",
    rating: toNumberOrNull(data?.rating),
    reviewCount: toNumberOrNull(data?.userRatingCount),
    reviews,
  }
}

async function fetchPlaceDetailsLegacyApi(apiKey: string, placeId: string) {
  const legacyUrl = new URL(GOOGLE_PLACE_DETAILS_LEGACY_URL)
  legacyUrl.searchParams.set("place_id", placeId)
  legacyUrl.searchParams.set(
    "fields",
    "name,rating,user_ratings_total,reviews"
  )
  legacyUrl.searchParams.set("key", apiKey)

  const res = await fetch(legacyUrl.toString(), { cache: "no-store" })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(`Places API (Legacy) details failed: ${message}`)
  }

  const data = await res.json()
  if (data?.status && data.status !== "OK") {
    throw new Error(
      `Places API (Legacy) details failed: status=${data.status}${data?.error_message ? ` message=${data.error_message}` : ""}`
    )
  }

  const result = data?.result || {}
  const reviews = (result?.reviews || [])
    .map(mapLegacyReview)
    .filter((review: GoogleReviewRecord | null): review is GoogleReviewRecord => review !== null)

  return {
    placeId,
    placeName: result?.name || "Google Business",
    rating: toNumberOrNull(result?.rating),
    reviewCount: toNumberOrNull(result?.user_ratings_total),
    reviews,
  }
}

async function fetchFromGoogle(apiKey: string): Promise<Omit<GoogleReviewsSnapshot, "fetchedAt">> {
  const placeId = getConfiguredPlaceId()

  let response: Omit<GoogleReviewsSnapshot, "fetchedAt">
  let newApiError = ""

  try {
    response = await fetchPlaceDetailsNewApi(apiKey, placeId)
  } catch (error) {
    newApiError = error instanceof Error ? error.message : "Unknown Places API (New) error"
    try {
      response = await fetchPlaceDetailsLegacyApi(apiKey, placeId)
    } catch (legacyError) {
      const legacyMessage =
        legacyError instanceof Error ? legacyError.message : "Unknown Places API (Legacy) error"
      throw new Error(`Both Google endpoints failed. New: ${newApiError}. Legacy: ${legacyMessage}`)
    }
  }

  const reviews = response.reviews
  if (reviews.length === 0) {
    throw new Error(
      `No reviews returned from Google for place ${placeId}.${newApiError ? ` New API error: ${newApiError}` : ""}`
    )
  }
  if (
    typeof response.reviewCount === "number" &&
    response.reviewCount > reviews.length
  ) {
    console.warn(
      `[google-reviews] Places API returned ${reviews.length} reviews while total count is ${response.reviewCount}. Configure GOOGLE_BUSINESS_LOCATION_NAME + Business Profile OAuth to sync all reviews.`
    )
  }

  return response
}

async function fetchLatestReviewsFromConfiguredSource(): Promise<Omit<GoogleReviewsSnapshot, "fetchedAt">> {
  const businessLocationName = getBusinessProfileLocationName()
  if (businessLocationName) {
    return fetchFromBusinessProfile()
  }
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_MAPS_API_KEY. If you want to sync all reviews, configure GOOGLE_BUSINESS_LOCATION_NAME + Business Profile OAuth credentials."
    )
  }
  return fetchFromGoogle(apiKey)
}

export async function getGoogleReviews({
  forceRefresh = false,
}: {
  forceRefresh?: boolean
} = {}): Promise<GoogleReviewsApiPayload> {
  const maxAgeMs = getCacheTtlMs()
  const cached = getGoogleReviewsSnapshot()

  if (!forceRefresh && cached && isFresh(cached, maxAgeMs)) {
    return {
      ...cached,
      source: "database",
      stale: false,
    }
  }

  try {
    const latest = await fetchLatestReviewsFromConfiguredSource()
    const stored = saveGoogleReviewsSnapshot(latest)
    return {
      ...stored,
      source: "google",
      stale: false,
    }
  } catch (error) {
    if (cached) {
      return {
        ...cached,
        source: "database",
        stale: true,
      }
    }
    throw error
  }
}
