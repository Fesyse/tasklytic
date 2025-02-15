import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/dashboard/sidebar"

export type DashboardLayoutProps = React.PropsWithChildren<{
  params: Promise<{ id: string; noteId?: string }>
}>

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="[background:_linear-gradient(to_right_bottom,_hsl(var(--background)),_hsl(var(--muted)/50%),_hsl(var(--background)))]">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
