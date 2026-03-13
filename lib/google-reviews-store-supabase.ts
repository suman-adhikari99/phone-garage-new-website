import { createHash } from "node:crypto"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export type GoogleReviewRecord = {
  authorName: string
  authorPhotoUrl: string
  rating: number
  text: string
  relativeDate: string
  publishedAt: string
}

export type GoogleReviewsSnapshot = {
  placeId: string
  placeName: string
  rating: number | null
  reviewCount: number | null
  reviews: GoogleReviewRecord[]
  fetchedAt: number
}

function makeReviewId(review: GoogleReviewRecord, index: number) {
  const seed = `${review.authorName}|${review.text}|${review.publishedAt}|${index}`
  return createHash("sha1").update(seed).digest("hex")
}

function normalizeNullableNumber(value: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function toMetaRows(snapshot: Omit<GoogleReviewsSnapshot, "fetchedAt">, fetchedAt: number) {
  return [
    { key: "place_id", value: snapshot.placeId },
    { key: "place_name", value: snapshot.placeName },
    { key: "rating", value: snapshot.rating === null ? "null" : String(snapshot.rating) },
    {
      key: "review_count",
      value: snapshot.reviewCount === null ? "null" : String(snapshot.reviewCount),
    },
    { key: "fetched_at", value: String(fetchedAt) },
  ]
}

export async function saveGoogleReviewsSnapshot(
  snapshot: Omit<GoogleReviewsSnapshot, "fetchedAt">
): Promise<GoogleReviewsSnapshot> {
  const client = getSupabaseAdminClient()
  const fetchedAt = Date.now()

  const { data: existingReviewRows, error: selectError } = await client
    .from("google_reviews")
    .select("id")

  if (selectError) {
    throw new Error(`Loading existing Google reviews failed: ${selectError.message}`)
  }

  const existingIds = ((existingReviewRows || []) as Array<{ id: string }>)
    .map((row) => row.id)
    .filter(Boolean)

  if (existingIds.length > 0) {
    const { error: deleteError } = await client
      .from("google_reviews")
      .delete()
      .in("id", existingIds)

    if (deleteError) {
      throw new Error(`Clearing Google reviews cache failed: ${deleteError.message}`)
    }
  }

  if (snapshot.reviews.length > 0) {
    const { error: insertError } = await client.from("google_reviews").insert(
      snapshot.reviews.map((review, index) => ({
        id: makeReviewId(review, index),
        place_id: snapshot.placeId,
        sort_order: index,
        author_name: review.authorName,
        author_photo_url: review.authorPhotoUrl,
        rating: review.rating,
        text: review.text,
        relative_date: review.relativeDate,
        published_at: review.publishedAt,
        fetched_at: fetchedAt,
      }))
    )

    if (insertError) {
      throw new Error(`Saving Google reviews failed: ${insertError.message}`)
    }
  }

  const { error: metaError } = await client
    .from("google_reviews_meta")
    .upsert(toMetaRows(snapshot, fetchedAt), { onConflict: "key" })

  if (metaError) {
    throw new Error(`Saving Google reviews metadata failed: ${metaError.message}`)
  }

  return {
    ...snapshot,
    fetchedAt,
  }
}

export async function getGoogleReviewsSnapshot(): Promise<GoogleReviewsSnapshot | null> {
  const client = getSupabaseAdminClient()
  const { data: metaRows, error: metaError } = await client
    .from("google_reviews_meta")
    .select("key, value")
    .in("key", ["place_id", "place_name", "rating", "review_count", "fetched_at"])

  if (metaError) {
    throw new Error(`Loading Google reviews metadata failed: ${metaError.message}`)
  }

  const meta = new Map(
    ((metaRows || []) as Array<{ key: string; value: string }>).map((row) => [
      row.key,
      row.value,
    ])
  )

  const placeId = meta.get("place_id")
  const placeName = meta.get("place_name")
  const fetchedAtRaw = meta.get("fetched_at")

  if (!placeId || !placeName || !fetchedAtRaw) {
    return null
  }

  const fetchedAt = Number(fetchedAtRaw)
  if (!Number.isFinite(fetchedAt) || fetchedAt <= 0) {
    return null
  }

  const { data: reviewRows, error: reviewsError } = await client
    .from("google_reviews")
    .select(
      "author_name, author_photo_url, rating, text, relative_date, published_at"
    )
    .order("sort_order", { ascending: true })

  if (reviewsError) {
    throw new Error(`Loading Google reviews failed: ${reviewsError.message}`)
  }

  const reviews = ((reviewRows || []) as Array<{
    author_name: string
    author_photo_url: string
    rating: number
    text: string
    relative_date: string
    published_at: string
  }>).map((row) => ({
    authorName: row.author_name,
    authorPhotoUrl: row.author_photo_url,
    rating: Number.isFinite(Number(row.rating)) ? Number(row.rating) : 0,
    text: row.text,
    relativeDate: row.relative_date,
    publishedAt: row.published_at,
  }))

  if (reviews.length === 0) {
    return null
  }

  const ratingRaw = meta.get("rating")
  const reviewCountRaw = meta.get("review_count")

  return {
    placeId,
    placeName,
    rating:
      ratingRaw && ratingRaw !== "null"
        ? normalizeNullableNumber(Number(ratingRaw))
        : null,
    reviewCount:
      reviewCountRaw && reviewCountRaw !== "null"
        ? normalizeNullableNumber(Number(reviewCountRaw))
        : null,
    reviews,
    fetchedAt,
  }
}
