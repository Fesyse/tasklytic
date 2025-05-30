"use client"

import { SidebarProvider } from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/layouts/dashboard/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { useSync } from "@/hooks/use-sync"
import { authClient } from "@/lib/auth-client"
import { useEffect } from "react"

// This component ensures notes are synced across all dashboard routes
const DashboardSync = () => {
  const { syncNow } = useSync()
  const { data: activeOrganization } = authClient.useActiveOrganization()

  // When the dashboard loads and we have an organization,
  // trigger a sync to ensure notes are up to date
  useEffect(() => {
    if (activeOrganization?.id) {
      // Sync immediately when dashboard loads
      syncNow().catch(console.error)
    }
  }, [activeOrganization?.id, syncNow])

  // This is just a utility component - it doesn't render anything
  return null
}

export const DashboardLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <SidebarProvider>
      {/* Add the sync component to ensure notes are synced in all dashboard routes */}
      <DashboardSync />

      <AppSidebar />
      <SidebarInset className="relative">{children}</SidebarInset>
    </SidebarProvider>
  )
}
