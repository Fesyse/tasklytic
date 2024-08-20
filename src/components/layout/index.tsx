"use client"

import { useSidebarToggle } from "@/hooks/use-sidebar-toggle"
import { useStore } from "@/hooks/use-store"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

export default function Layout({ children }: React.PropsWithChildren) {
  const sidebar = useStore(useSidebarToggle, state => state)

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
    </>
  )
}
