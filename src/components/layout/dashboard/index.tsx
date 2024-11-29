import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

type DashboardLayoutProps = React.PropsWithChildren<{
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
