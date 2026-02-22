"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { LockKeyhole, LogIn, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "Login failed.")
      }

      router.replace("/dashboard")
      router.refresh()
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Login failed."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#f5f4ef_0%,#eceae1_50%,#f8f7f2_100%)] px-4 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(17,17,17,0.12),transparent_34%),radial-gradient(circle_at_90%_80%,rgba(17,17,17,0.08),transparent_35%)]"
      />

      <section className="relative mx-auto max-w-md rounded-[30px] border border-zinc-300/80 bg-white/90 p-6 shadow-[0_44px_90px_-56px_rgba(0,0,0,0.8)] backdrop-blur sm:p-7">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-300 bg-zinc-900 text-white">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Admin Access
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
            Phone Garage Dashboard Login
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Sign in to manage quotes, update repair statuses, and view customer
            details.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">
              <UserRound className="h-3.5 w-3.5" />
              Username
            </span>
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter admin username"
              autoComplete="username"
              className="h-11 rounded-xl border-zinc-300 bg-white text-zinc-900 focus-visible:border-zinc-900 focus-visible:ring-zinc-900/15"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">
              <LockKeyhole className="h-3.5 w-3.5" />
              Password
            </span>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              className="h-11 rounded-xl border-zinc-300 bg-white text-zinc-900 focus-visible:border-zinc-900 focus-visible:ring-zinc-900/15"
              required
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <LogIn className="h-4 w-4" />
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </section>
    </main>
  )
}
