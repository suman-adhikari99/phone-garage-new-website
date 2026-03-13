import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseAdminClient: SupabaseClient | null = null

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`)
  }
  return value
}

function getSupabaseUrl() {
  const explicitUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ""

  if (explicitUrl) return explicitUrl

  const databaseUrl = process.env.SUPABASE_DB_URL?.trim() || ""
  if (!databaseUrl) return ""

  try {
    const parsed = new URL(databaseUrl)
    const hostname = parsed.hostname.trim().toLowerCase()
    if (!hostname.startsWith("db.") || !hostname.endsWith(".supabase.co")) {
      return ""
    }

    return `https://${hostname.slice(3)}`
  } catch {
    return ""
  }
}

export function getSupabaseAdminClient() {
  if (supabaseAdminClient) return supabaseAdminClient

  const url = getSupabaseUrl()
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL). A valid SUPABASE_DB_URL can also be used to infer the project URL."
    )
  }

  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")

  supabaseAdminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return supabaseAdminClient
}

export function getBookingUploadsBucketName() {
  return process.env.SUPABASE_BOOKING_UPLOADS_BUCKET?.trim() || "booking-uploads"
}
