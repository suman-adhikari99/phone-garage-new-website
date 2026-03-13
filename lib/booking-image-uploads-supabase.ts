import { Buffer } from "node:buffer"
import { getBookingUploadsBucketName, getSupabaseAdminClient } from "@/lib/supabase-admin"

export type BookingEmailAttachment = {
  filename: string
  content: string
}

const MAX_UPLOAD_FILES = 4
const MAX_UPLOAD_SIZE_BYTES = 4 * 1024 * 1024
const MAX_TOTAL_ATTACHMENT_BYTES = 12 * 1024 * 1024

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
}

let ensureBucketPromise: Promise<void> | null = null

function sanitizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function safeBookingFolder(bookingRef: string) {
  const normalized = sanitizeSegment(bookingRef)
  return normalized || "booking"
}

function extractBaseName(value: string) {
  const raw = value.trim()
  const dotIndex = raw.lastIndexOf(".")
  const withoutExt = dotIndex > 0 ? raw.slice(0, dotIndex) : raw
  const normalized = sanitizeSegment(withoutExt)
  return normalized || "image"
}

function extensionFromFile(file: File) {
  const typeExt = MIME_EXTENSION_MAP[file.type.toLowerCase()]
  if (typeExt) return typeExt

  const name = file.name.trim()
  const dotIndex = name.lastIndexOf(".")
  if (dotIndex > -1 && dotIndex < name.length - 1) {
    const ext = sanitizeSegment(name.slice(dotIndex + 1))
    if (ext) return ext
  }

  return "jpg"
}

function isValidImageFile(file: File) {
  if (!file.type.toLowerCase().startsWith("image/")) return false
  if (!Number.isFinite(file.size) || file.size <= 0) return false
  if (file.size > MAX_UPLOAD_SIZE_BYTES) return false
  return true
}

function getBookingUploadsPath(bookingRef: string) {
  return safeBookingFolder(bookingRef)
}

async function ensureBookingUploadsBucket() {
  if (ensureBucketPromise) return ensureBucketPromise

  ensureBucketPromise = (async () => {
    const client = getSupabaseAdminClient()
    const bucketName = getBookingUploadsBucketName()

    const { error } = await client.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: MAX_UPLOAD_SIZE_BYTES,
      allowedMimeTypes: Object.keys(MIME_EXTENSION_MAP),
    })

    if (
      error &&
      !/already exists/i.test(error.message) &&
      !/duplicate/i.test(error.message)
    ) {
      throw new Error(`Creating booking uploads bucket failed: ${error.message}`)
    }
  })()

  return ensureBucketPromise
}

export async function saveBookingImageUploads(bookingRef: string, files: File[]) {
  await ensureBookingUploadsBucket()

  const bookingPath = getBookingUploadsPath(bookingRef)
  const candidates = files.filter(isValidImageFile).slice(0, MAX_UPLOAD_FILES)
  if (candidates.length === 0) return []

  const client = getSupabaseAdminClient()
  const bucketName = getBookingUploadsBucketName()
  const saved: string[] = []

  for (let index = 0; index < candidates.length; index += 1) {
    const file = candidates[index]
    const baseName = extractBaseName(file.name)
    const extension = extensionFromFile(file)
    const fileName = `${String(index + 1).padStart(2, "0")}-${baseName}.${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())

    if (!buffer.length || buffer.length > MAX_UPLOAD_SIZE_BYTES) {
      continue
    }

    const objectPath = `${bookingPath}/${fileName}`
    const { error } = await client.storage.from(bucketName).upload(objectPath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    })

    if (error) {
      throw new Error(`Saving booking upload failed: ${error.message}`)
    }

    saved.push(fileName)
  }

  return saved
}

export async function getBookingEmailAttachments(
  bookingRef: string
): Promise<BookingEmailAttachment[]> {
  await ensureBookingUploadsBucket()

  const bookingPath = getBookingUploadsPath(bookingRef)
  const client = getSupabaseAdminClient()
  const bucketName = getBookingUploadsBucketName()

  const { data: listed, error: listError } = await client.storage
    .from(bucketName)
    .list(bookingPath, {
      limit: MAX_UPLOAD_FILES,
      sortBy: { column: "name", order: "asc" },
    })

  if (listError) {
    if (/not found/i.test(listError.message)) return []
    throw new Error(`Loading booking uploads failed: ${listError.message}`)
  }

  const attachments: BookingEmailAttachment[] = []
  let totalBytes = 0

  for (const file of listed || []) {
    const name = file.name?.trim() || ""
    if (!name) continue

    const size =
      typeof file.metadata?.size === "number"
        ? file.metadata.size
        : Number(file.metadata?.size || 0)

    if (!Number.isFinite(size) || size <= 0) continue
    if (size > MAX_UPLOAD_SIZE_BYTES) continue
    if (totalBytes + size > MAX_TOTAL_ATTACHMENT_BYTES) continue

    const { data, error } = await client.storage
      .from(bucketName)
      .download(`${bookingPath}/${name}`)

    if (error || !data) {
      continue
    }

    const buffer = Buffer.from(await data.arrayBuffer())
    if (!buffer.length) continue

    attachments.push({
      filename: name,
      content: buffer.toString("base64"),
    })
    totalBytes += buffer.length
  }

  return attachments
}
