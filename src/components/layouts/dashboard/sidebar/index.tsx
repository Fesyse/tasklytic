"use client"

import { NavMain } from "@/components/layouts/dashboard/sidebar/nav-main"
import { NavSecondary } from "@/components/layouts/dashboard/sidebar/nav-secondary"
import { NavUser } from "@/components/layouts/dashboard/sidebar/nav-user"
import { Icons } from "@/components/ui/icons"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { useSidebarNav } from "@/lib/sidebar"
import { siteConfig } from "@/lib/site-config"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar()
  const sidebarNav = useSidebarNav()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center">
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 [&>svg]:size-7"
            >
              <Link href="/">
                <Icons.icon />
                <span className="text-base font-semibold">
                  {siteConfig.name}
                </span>
              </Link>
            </SidebarMenuButton>
            <AnimatePresence>
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 25 }}
              >
                {open ? <SidebarTrigger /> : null}
              </motion.div>
            </AnimatePresence>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarNav.navMain} />
        <NavSecondary items={sidebarNav.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
