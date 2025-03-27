"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/layout/dashboard/sidebar/nav-main"
import { NavPinnedNotes } from "@/components/layout/dashboard/sidebar/nav-pinned-notes"
import { NavSecondary } from "@/components/layout/dashboard/sidebar/nav-secondary"
import { ProjectSwitcher } from "@/components/layout/dashboard/sidebar/project-switcher"
import { DashboardNavUser } from "./nav-user"
import { NavWorkspace } from "./nav-workspace"
import { useSidebarNav } from "@/lib/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebar = useSidebarNav()

  return (
    <Sidebar
      className="border-r-0"
      style={{
        backgroundImage:
          "radial-gradient(closest-corner at 120px 36px, rgba(255, 1, 111, 0.19), rgba(255, 1, 111, 0.08)), linear-gradient(rgb(63, 51, 69) 15%, rgb(7, 3, 9)) !important"
      }}
      {...props}
    >
      <SidebarHeader>
        <ProjectSwitcher projects={sidebar.projects} />
        <NavMain navigation={sidebar.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavPinnedNotes pinnedNotes={sidebar.pinnedNotes} />
        <NavWorkspace workspace={sidebar.workspace} />
        <NavSecondary items={sidebar.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <DashboardNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
