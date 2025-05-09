"use client"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { siteConfig } from "@/lib/site-config"
import {
  CalendarCheck,
  CalendarIcon,
  HomeIcon,
  InboxIcon,
  SettingsIcon
} from "lucide-react"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: HomeIcon
    },
    {
      title: "Inbox",
      url: "/dashboard/inbox",
      icon: InboxIcon
    }
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "/dashboard/calendar",
      icon: CalendarIcon
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: SettingsIcon
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <CalendarCheck className="!size-5" />
                <span className="text-base font-semibold">
                  {siteConfig.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
