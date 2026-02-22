import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises"
import { join } from "node:path"

export type BookingEmailAttachment = {
  filename: string
  content: string
}

const BOOKING_UPLOADS_DIR =
  process.env.BOOKING_UPLOADS_DIR?.trim() ||
  join(process.cwd(), "data", "booking-uploads")

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
  return join(BOOKING_UPLOADS_DIR, safeBookingFolder(bookingRef))
}

export async function saveBookingImageUploads(bookingRef: string, files: File[]) {
  const bookingPath = getBookingUploadsPath(bookingRef)
  const candidates = files.filter(isValidImageFile).slice(0, MAX_UPLOAD_FILES)
  if (candidates.length === 0) return []

  await mkdir(bookingPath, { recursive: true })

  const saved: string[] = []

  for (let index = 0; index < candidates.length; index += 1) {
    const file = candidates[index]
    const baseName = extractBaseName(file.name)
    const extension = extensionFromFile(file)
    const fileName = `${String(index + 1).padStart(2, "0")}-${baseName}.${extension}`
    const filePath = join(bookingPath, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())

    if (!buffer.length || buffer.length > MAX_UPLOAD_SIZE_BYTES) {
      continue
    }

    await writeFile(filePath, buffer)
    saved.push(fileName)
  }

  return saved
}

export async function getBookingEmailAttachments(
  bookingRef: string
): Promise<BookingEmailAttachment[]> {
  const bookingPath = getBookingUploadsPath(bookingRef)

  let fileNames: string[] = []
  try {
    fileNames = await readdir(bookingPath)
  } catch {
    return []
  }

  const sorted = fileNames.sort().slice(0, MAX_UPLOAD_FILES)
  const attachments: BookingEmailAttachment[] = []
  let totalBytes = 0

  for (const name of sorted) {
    const filePath = join(bookingPath, name)
    let fileStat
    try {
      fileStat = await stat(filePath)
    } catch {
      continue
    }

    if (!fileStat.isFile() || fileStat.size <= 0) continue
    if (fileStat.size > MAX_UPLOAD_SIZE_BYTES) continue
    if (totalBytes + fileStat.size > MAX_TOTAL_ATTACHMENT_BYTES) continue

    const buffer = await readFile(filePath)
    if (!buffer.length) continue

    attachments.push({
      filename: name,
      content: buffer.toString("base64"),
    })
    totalBytes += fileStat.size
  }

  return attachments
}
