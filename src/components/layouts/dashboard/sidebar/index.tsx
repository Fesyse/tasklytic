"use client"

import { NavMain } from "@/components/layouts/dashboard/sidebar/nav-main"
import { NavSecondary } from "@/components/layouts/dashboard/sidebar/nav-secondary"
import { NavUser } from "@/components/layouts/dashboard/sidebar/nav-user"
import { OrganizationSwitcher } from "@/components/layouts/dashboard/sidebar/organization-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { useSidebarNav } from "@/lib/sidebar"
import { AnimatePresence, motion } from "motion/react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar()
  const sidebarNav = useSidebarNav()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="grid grid-cols-[1fr_auto] items-center gap-2">
            <OrganizationSwitcher />
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
