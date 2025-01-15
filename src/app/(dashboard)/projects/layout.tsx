import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DashboardLayout,
  type DashboardLayoutProps
} from "@/components/layout/dashboard"

export default function Layout({ children, ...props }: DashboardLayoutProps) {
  return (
    <DashboardLayout {...props}>
      <header className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
        </div>
      </header>
      {children}
    </DashboardLayout>
  )
}
