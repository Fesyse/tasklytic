import Link from "next/link"
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle"
import { useStore } from "@/hooks/use-store"
import { Menu } from "@/components/layout/menu"
import { SidebarToggle } from "@/components/layout/sidebar/sidebar-toggle"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, state => state)

  if (!sidebar) return null

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        {
          "w-[90px]": !sidebar?.isOpen,
          "w-72": sidebar?.isOpen
        }
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn("transition-transform ease-in-out duration-300 mb-1")}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-center">
            <Icons.icon className="w-12 h-12" />
            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                {
                  "translate-x-0 opacity-100": sidebar?.isOpen,
                  "-translate-x-96 opacity-0 hidden": !sidebar?.isOpen
                }
              )}
            >
              Tasklytic
            </h1>
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  )
}
