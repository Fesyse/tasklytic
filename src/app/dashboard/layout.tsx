import { DashboardLayout as Layout } from "@/components/layouts/dashboard"
import { SyncProvider } from "@/providers/sync-provider"
import type React from "react"

export default function DashboardLayout({ children }: React.PropsWithChildren) {
  return (
    <SyncProvider>
      <Layout>{children}</Layout>
    </SyncProvider>
  )
}
