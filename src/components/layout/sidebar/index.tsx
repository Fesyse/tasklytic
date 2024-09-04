import Link from "next/link"
import { Menu } from "@/components/layout/menu"
import { SidebarToggle } from "@/components/layout/sidebar/sidebar-toggle"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { type Project } from "@/server/db/schema"

type SidebarProps = {
  sidebar: {
    isOpen: boolean
    setIsOpen: () => void
  }
  projects: Project[] | null
}

export function Sidebar({ sidebar, projects }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 h-screen -translate-x-full bg-muted font-comfortaa transition-[width] duration-300 ease-in-out dark:bg-muted/25 lg:translate-x-0",
        {
          "w-sidebar-collapsed": !sidebar.isOpen,
          "w-sidebar": sidebar.isOpen
        }
      )}
    >
      <SidebarToggle isOpen={sidebar.isOpen} setIsOpen={sidebar.setIsOpen} />
      <div className="relative flex h-full flex-col overflow-y-auto px-3 py-4 shadow-md dark:shadow-zinc-800">
        <Button
          className={cn("mb-1 transition-transform duration-300 ease-in-out")}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-center">
            <Icons.icon className="h-12 w-12" />
            <div
              className={cn(
                "whitespace-nowrap text-lg font-bold transition-[transform,opacity,display] duration-300 ease-in-out",
                {
                  "translate-x-0 opacity-100": sidebar.isOpen,
                  "hidden -translate-x-96 opacity-0": !sidebar.isOpen
                }
              )}
            >
              Tasklytic
            </div>
          </Link>
        </Button>
        <Menu projects={projects} isOpen={sidebar.isOpen} />
      </div>
    </aside>
  )
}
