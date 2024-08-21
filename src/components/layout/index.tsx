"use client"

import { LayoutDashboard, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle"
import { useStore } from "@/hooks/use-store"
import { Sidebar } from "@/components/layout/sidebar"
import { FloatingDock } from "@/components/ui/floating-dock"
import { cn } from "@/lib/utils"

export default function Layout({ children }: React.PropsWithChildren) {
  const sidebar = useStore(useSidebarToggle, state => state)
  const pathname = usePathname()

  if (!sidebar) return null

  return (
    <>
      <Sidebar sidebar={sidebar} />
      <main
        className={cn(
          "min-h-screen transition-[margin-left] duration-300 ease-in-out",
          {
            "lg:ml-sidebar-collapsed": !sidebar.isOpen,
            "lg:ml-sidebar": sidebar.isOpen
          }
        )}
      >
        {children}
      </main>
      {/* <FloatingDock
        desktopClassName="fixed bottom-0 left-1/2 -translate-x-1/2 z-50"
        items={[
          {
            href: "/dashboard",
            label: "Dashboard",
            active: pathname.startsWith("/dashboard"),
            icon: LayoutDashboard,
            submenus: []
          },
          {
            href: "/settings",
            label: "Settings",
            icon: Settings,
            active: pathname.startsWith("/settings"),
            submenus: []
          }
        ]}
      /> */}
    </>
  )
}
