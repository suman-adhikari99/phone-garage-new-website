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
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ""
  )
}

export function getSupabaseAdminClient() {
  if (supabaseAdminClient) return supabaseAdminClient

  const url = getSupabaseUrl()
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) for Supabase setup."
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
