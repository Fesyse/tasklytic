"use client"

import { useStore } from "@/hooks/use-store"
import { DockNavigation } from "@/components/layout/dock-navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"
import { useUserSettingsStore } from "@/stores/user-settings.store"

export function Layout({ children }: React.PropsWithChildren) {
  const userSettings = useStore(useUserSettingsStore, s => s)

  if (!userSettings) return null
  const { sidebar, navigationMenu } = userSettings

  return (
    <>
      {navigationMenu === "sidebar" ? (
        <Sidebar sidebar={sidebar} />
      ) : navigationMenu === "floating-dock" ? (
        <DockNavigation />
      ) : null}
      <main
        className={cn(
          "min-h-screen transition-[margin-left] duration-300 ease-in-out",
          {
            "lg:ml-sidebar-collapsed":
              !sidebar.isOpen && navigationMenu === "sidebar",
            "lg:ml-sidebar": sidebar.isOpen && navigationMenu === "sidebar"
          }
        )}
      >
        {children}
      </main>
    </>
  )
}
