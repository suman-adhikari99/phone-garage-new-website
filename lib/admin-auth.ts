import { createHmac, timingSafeEqual } from "crypto"

export const ADMIN_SESSION_COOKIE_NAME = "pg_admin_session"
export const ADMIN_LOGIN_PATH = "/admin-login"
export const ADMIN_DASHBOARD_PATH = "/dashboard"

const ADMIN_DEFAULT_USERNAME = "phonegarageadmin"
const ADMIN_DEFAULT_PASSWORD = "adminphonegarage2026"
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7
const ADMIN_SESSION_VERSION = "v1"

function getAdminUsername() {
  return process.env.ADMIN_USERNAME?.trim() || ADMIN_DEFAULT_USERNAME
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || ADMIN_DEFAULT_PASSWORD
}

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.BOOKINGS_API_SECRET?.trim() ||
    "phone-garage-admin-session-secret-change-this"
  )
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

export function isValidAdminCredentials(username: string, password: string) {
  const normalizedUsername = username.trim()
  const normalizedPassword = password.trim()

  return (
    safeCompare(normalizedUsername, getAdminUsername()) &&
    safeCompare(normalizedPassword, getAdminPassword())
  )
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex")
}

export function createAdminSessionToken() {
  const issuedAt = Date.now()
  const username = getAdminUsername()
  const payload = `${ADMIN_SESSION_VERSION}.${username}.${issuedAt}`
  const signature = signPayload(payload)
  return `${payload}.${signature}`
}

function verifyAdminSessionToken(token: string) {
  const normalized = token.trim()
  if (!normalized) return false

  const parts = normalized.split(".")
  if (parts.length < 4) return false

  const signature = parts[parts.length - 1]
  const payloadParts = parts.slice(0, -1)
  const payload = payloadParts.join(".")

  const [version, username, issuedAtRaw] = payloadParts
  if (version !== ADMIN_SESSION_VERSION) return false
  if (!username || !safeCompare(username, getAdminUsername())) return false

  const issuedAt = Number(issuedAtRaw)
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) return false

  const age = Date.now() - issuedAt
  if (age < 0 || age > ADMIN_SESSION_TTL_SECONDS * 1000) return false

  const expectedSignature = signPayload(payload)
  return safeCompare(signature, expectedSignature)
}

export function isAdminAuthenticatedFromSessionToken(token: string) {
  return verifyAdminSessionToken(token)
}

export function getCookieValue(rawCookieHeader: string, cookieName: string) {
  if (!rawCookieHeader.trim() || !cookieName.trim()) return ""

  const cookieParts = rawCookieHeader.split(";")
  for (const entry of cookieParts) {
    const [name, ...rest] = entry.trim().split("=")
    if (name === cookieName) {
      return decodeURIComponent(rest.join("="))
    }
  }

  return ""
}

export function isAdminAuthenticatedFromCookieHeader(rawCookieHeader: string) {
  const token = getCookieValue(rawCookieHeader, ADMIN_SESSION_COOKIE_NAME)
  return verifyAdminSessionToken(token)
}

export function isAdminAuthenticatedFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  return isAdminAuthenticatedFromCookieHeader(cookieHeader)
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: ADMIN_SESSION_TTL_SECONDS,
}
