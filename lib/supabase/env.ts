/**
 * Browser-safe Supabase URL + anon key (both are designed for public clients).
 * Supports common naming mistakes (missing NEXT_PUBLIC_*, stray whitespace).
 */
export function resolveSupabasePublicEnv(): {
  url: string | null
  anonKey: string | null
} {
  const url = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
  )
  const anonKey = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
  return { url, anonKey }
}

function firstNonEmpty(...vals: Array<string | undefined>): string | null {
  for (const raw of vals) {
    const v = raw?.trim()
    if (v) return v
  }
  return null
}
