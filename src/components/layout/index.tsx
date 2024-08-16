"use client"

import { useSidebarToggle } from "@/hooks/use-sidebar-toggle"
import { useStore } from "@/hooks/use-store"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

export default function Layout({ children }: { children: React.ReactNode }) {
  const sidebar = useStore(useSidebarToggle, state => state)

  if (!sidebar) return null

  return (
    <>
      <Sidebar sidebar={sidebar} />
      <main
        className={cn(
          "min-h-screen transition-[margin-left] ease-in-out duration-300",
          {
            "lg:ml-sidebar-open": !sidebar.isOpen,
            "lg:ml-sidebar": sidebar.isOpen
          }
        )}
      >
        {children}
      </main>
      <footer
        className={cn("transition-[margin-left] ease-in-out duration-300", {
          "lg:ml-sidebar-open": !sidebar.isOpen,
          "lg:ml-sidebar": sidebar.isOpen
        })}
      >
        <Footer />
      </footer>
    </>
  )
}
