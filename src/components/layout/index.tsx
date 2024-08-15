"use client"

import { useSidebarToggle } from "@/hooks/use-sidebar-toggle"
import { useStore } from "@/hooks/use-store"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "./navbar"
import { cn } from "@/lib/utils"

export default function Layout({ children }: { children: React.ReactNode }) {
  const sidebar = useStore(useSidebarToggle, state => state)

  if (!sidebar) return null

  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          {
            "lg:ml-[90px]": !sidebar?.isOpen,
            "lg:ml-72": sidebar?.isOpen
          }
        )}
      >
        {children}
      </main>
      <footer
        className={cn("transition-[margin-left] ease-in-out duration-300", {
          "lg:ml-[90px]": !sidebar?.isOpen,
          "lg:ml-72": sidebar?.isOpen
        })}
      >
        <Footer />
      </footer>
    </>
  )
}
