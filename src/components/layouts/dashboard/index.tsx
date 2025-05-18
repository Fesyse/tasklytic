import { SidebarProvider } from "@/components/ui/sidebar"

import { InnerSidebarTrigger } from "@/components/layouts/dashboard/inner-sidebar-trigger"
import { FloatingActions } from "@/components/layouts/dashboard/note-page/floating-actions"
import { AppSidebar } from "@/components/layouts/dashboard/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export const DashboardLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative">
        <InnerSidebarTrigger />
        <FloatingActions />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
