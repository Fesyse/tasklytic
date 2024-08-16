import Link from "next/link"
import {
  type UseSidebarToggleStore,
  useSidebarToggle
} from "@/hooks/use-sidebar-toggle"
import { useStore } from "@/hooks/use-store"
import { Menu } from "@/components/layout/menu"
import { SidebarToggle } from "@/components/layout/sidebar/sidebar-toggle"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

type SidebarProps = {
  sidebar: UseSidebarToggleStore
}

export function Sidebar({ sidebar }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300 dark:bg-muted/20 bg-muted font-comfortaa",
        {
          "w-sidebar-open": !sidebar.isOpen,
          "w-sidebar": sidebar.isOpen
        }
      )}
    >
      <SidebarToggle isOpen={sidebar.isOpen} setIsOpen={sidebar.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn("transition-transform ease-in-out duration-300 mb-1")}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-center">
            <Icons.icon className="w-12 h-12" />
            <div
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                {
                  "translate-x-0 opacity-100": sidebar.isOpen,
                  "-translate-x-96 opacity-0 hidden": !sidebar.isOpen
                }
              )}
            >
              Tasklytic
            </div>
          </Link>
        </Button>
        <Menu isOpen={sidebar.isOpen} />
      </div>
    </aside>
  )
}
