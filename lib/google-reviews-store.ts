import { createHash } from "node:crypto"
import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { resolveWritableStoragePath } from "@/lib/server-storage-path"

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

const DB_PATH =
  resolveWritableStoragePath(
    process.env.GOOGLE_REVIEWS_DB_PATH,
    "data/google-reviews.sqlite"
  )

let db: DatabaseSync | null = null

function getDb() {
  if (db) return db

  mkdirSync(dirname(DB_PATH), { recursive: true })
  db = new DatabaseSync(DB_PATH)

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS google_reviews_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS google_reviews (
      id TEXT PRIMARY KEY,
      place_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      author_photo_url TEXT NOT NULL,
      rating REAL NOT NULL,
      text TEXT NOT NULL,
      relative_date TEXT NOT NULL,
      published_at TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );
  `)

  return db
}

function makeReviewId(review: GoogleReviewRecord, index: number) {
  const seed = `${review.authorName}|${review.text}|${review.publishedAt}|${index}`
  return createHash("sha1").update(seed).digest("hex")
}

function setMeta(key: string, value: string) {
  const database = getDb()
  database
    .prepare(`
      INSERT INTO google_reviews_meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `)
    .run(key, value)
}

function getMeta(key: string) {
  const database = getDb()
  const row = database
    .prepare("SELECT value FROM google_reviews_meta WHERE key = ?")
    .get(key) as { value: string } | undefined
  return row?.value
}

export function saveGoogleReviewsSnapshot(
  snapshot: Omit<GoogleReviewsSnapshot, "fetchedAt">
): GoogleReviewsSnapshot {
  const database = getDb()
  const fetchedAt = Date.now()

  try {
    database.exec("BEGIN IMMEDIATE")

    database.prepare("DELETE FROM google_reviews").run()

    const insertStmt = database.prepare(`
      INSERT INTO google_reviews (
        id,
        place_id,
        sort_order,
        author_name,
        author_photo_url,
        rating,
        text,
        relative_date,
        published_at,
        fetched_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    snapshot.reviews.forEach((review, index) => {
      insertStmt.run(
        makeReviewId(review, index),
        snapshot.placeId,
        index,
        review.authorName,
        review.authorPhotoUrl,
        review.rating,
        review.text,
        review.relativeDate,
        review.publishedAt,
        fetchedAt
      )
    })

    setMeta("place_id", snapshot.placeId)
    setMeta("place_name", snapshot.placeName)
    setMeta("rating", snapshot.rating === null ? "null" : String(snapshot.rating))
    setMeta("review_count", snapshot.reviewCount === null ? "null" : String(snapshot.reviewCount))
    setMeta("fetched_at", String(fetchedAt))
    database.exec("COMMIT")
  } catch (error) {
    database.exec("ROLLBACK")
    throw error
  }

  return {
    ...snapshot,
    fetchedAt,
  }
}

export function getGoogleReviewsSnapshot(): GoogleReviewsSnapshot | null {
  const database = getDb()
  const placeId = getMeta("place_id")
  const placeName = getMeta("place_name")
  const fetchedAtRaw = getMeta("fetched_at")

  if (!placeId || !placeName || !fetchedAtRaw) {
    return null
  }

  const fetchedAt = Number(fetchedAtRaw)
  if (!Number.isFinite(fetchedAt) || fetchedAt <= 0) {
    return null
  }

  const ratingRaw = getMeta("rating")
  const reviewCountRaw = getMeta("review_count")
  const rating = ratingRaw && ratingRaw !== "null" ? Number(ratingRaw) : null
  const reviewCount = reviewCountRaw && reviewCountRaw !== "null" ? Number(reviewCountRaw) : null

  const rows = database
    .prepare(`
      SELECT
        author_name,
        author_photo_url,
        rating,
        text,
        relative_date,
        published_at
      FROM google_reviews
      ORDER BY sort_order ASC
    `)
    .all() as Array<{
    author_name: string
    author_photo_url: string
    rating: number
    text: string
    relative_date: string
    published_at: string
  }>

  if (rows.length === 0) {
    return null
  }

  return {
    placeId,
    placeName,
    rating: Number.isFinite(Number(rating)) ? Number(rating) : null,
    reviewCount: Number.isFinite(Number(reviewCount)) ? Number(reviewCount) : null,
    fetchedAt,
    reviews: rows.map((row) => ({
      authorName: row.author_name,
      authorPhotoUrl: row.author_photo_url,
      rating: Number(row.rating),
      text: row.text,
      relativeDate: row.relative_date,
      publishedAt: row.published_at,
    })),
  }
}
