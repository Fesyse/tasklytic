"use client"

import {
  IconCalendar,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
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
import { CalendarCheck, ListTodo } from "lucide-react"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard
    },
    {
      title: "Todos",
      url: "/dashboard/todos",
      icon: ListTodo
    },
    {
      title: "Calendar",
      url: "/dashboard/calendar",
      icon: IconCalendar
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: IconFolder
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: IconUsers
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings
    },
    {
      title: "Get Help",
      url: "/dashboard/help",
      icon: IconHelp
    },
    {
      title: "Search",
      url: "/dashboard/search",
      icon: IconSearch
    }
  ],
  documents: [
    {
      name: "Data Library",
      url: "/dashboard/data-library",
      icon: IconDatabase
    },
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: IconReport
    },
    {
      name: "Word Assistant",
      url: "/dashboard/word-assistant",
      icon: IconFileWord
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
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
