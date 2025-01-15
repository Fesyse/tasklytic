import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/dashboard/sidebar"

export type DashboardLayoutProps = React.PropsWithChildren<{
  params: Promise<{ id: string; noteId?: string }>
}>

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
