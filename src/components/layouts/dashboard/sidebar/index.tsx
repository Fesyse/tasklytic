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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar()
  const sidebarNav = useSidebarNav()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <OrganizationSwitcher />
            {open ? <SidebarTrigger className="size-8" /> : null}
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
