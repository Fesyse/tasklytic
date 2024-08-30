"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { useUserSettingsStore } from "@/components/providers/user-settings-store-provider"
import { DockNavigation } from "./dock-navigation"
import { cn } from "@/lib/utils"

export function Layout({ children }: React.PropsWithChildren) {
  const { sidebar, navigationMenu, setIsSidebarOpen } = useUserSettingsStore(
    s => s
  )

  return (
    <>
      {navigationMenu === "sidebar" ? (
        <Sidebar sidebar={{ ...sidebar, setIsOpen: setIsSidebarOpen }} />
      ) : null}
      <main
        className={cn(
          "min-h-screen transition-[margin-left] duration-300 ease-in-out",
          navigationMenu === "sidebar"
            ? {
                "lg:ml-sidebar-collapsed": !sidebar.isOpen,
                "lg:ml-sidebar": sidebar.isOpen
              }
            : ""
        )}
      >
        {children}
      </main>
      {navigationMenu === "floating-dock" ? <DockNavigation /> : null}
    </>
  )
}
