const DEFAULT_SITE_URL = "https://www.phonegarage.com.au"

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`

  return withProtocol.replace(/\/+$/, "")
}

export function getSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    DEFAULT_SITE_URL,
  ]

  for (const candidate of candidates) {
    const normalized = normalizeSiteUrl(candidate || "")
    if (normalized) return normalized
  }

  return DEFAULT_SITE_URL
}

export function getMetadataBase() {
  return new URL(getSiteUrl())
}

export function toAbsoluteUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${getSiteUrl()}${normalizedPath}`
}
