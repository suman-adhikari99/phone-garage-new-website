import { join } from "node:path"

function toSafeRelativePath(input: string) {
  const segments = input
    .replace(/\\/g, "/")
    .trim()
    .split("/")
    .filter((segment) => segment.length > 0 && segment !== "." && segment !== "..")

  return segments.join("/")
}

function defaultLocalPath(fallbackRelativePath: string) {
  return join(process.cwd(), fallbackRelativePath)
}

export function resolveWritableStoragePath(
  configuredPath: string | undefined,
  fallbackRelativePath: string
) {
  const normalizedConfigured = configuredPath?.trim() || ""

  if (!process.env.VERCEL) {
    return normalizedConfigured || defaultLocalPath(fallbackRelativePath)
  }

  // Vercel serverless filesystem is writable only under /tmp.
  if (
    normalizedConfigured.startsWith("/tmp/") ||
    normalizedConfigured === "/tmp"
  ) {
    return normalizedConfigured
  }

  const requestedPath = normalizedConfigured || fallbackRelativePath
  const relativePath = toSafeRelativePath(requestedPath)
  const fallbackPath = toSafeRelativePath(fallbackRelativePath)

  return join("/tmp", relativePath || fallbackPath)
}
