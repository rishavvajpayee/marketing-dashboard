import { DashboardApp } from "@/components/dashboard/dashboard-app"
import { DashboardProvider } from "@/components/dashboard/dashboard-provider"
import { resolveSupabasePublicEnv } from "@/lib/supabase/env"

export default function Page() {
  const { url, anonKey } = resolveSupabasePublicEnv()

  return (
    <DashboardProvider supabaseUrl={url} supabaseAnonKey={anonKey}>
      <DashboardApp />
    </DashboardProvider>
  )
}
