import { SidebarProvider } from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/app-sidebar"
import { InnerSidebarTrigger } from "@/components/inner-sidebar-trigger"
import { SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: React.PropsWithChildren) {
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
