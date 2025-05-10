import { SidebarProvider } from "@/components/ui/sidebar"

import { InnerSidebarTrigger } from "@/components/layouts/dashboard/inner-sidebar-trigger"
import { AppSidebar } from "@/components/layouts/dashboard/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export const DashboardLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)"
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="relative">
        <InnerSidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
