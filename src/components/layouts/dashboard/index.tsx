import { SidebarProvider } from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/layouts/dashboard/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export const DashboardLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative">{children}</SidebarInset>
    </SidebarProvider>
  )
}
