"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/layout/dashboard/sidebar/nav-main"
import { NavNotes } from "@/components/layout/dashboard/sidebar/nav-notes"
import { NavPinnedNotes } from "@/components/layout/dashboard/sidebar/nav-pinned-notes"
import { NavSecondary } from "@/components/layout/dashboard/sidebar/nav-secondary"
import { ProjectSwitcher } from "@/components/layout/dashboard/sidebar/project-switcher"
import { useSidebarNav } from "@/lib/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = useSidebarNav()

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <ProjectSwitcher projects={data.projects} />
        <NavMain navigation={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavPinnedNotes pinnedNotes={data.pinnedNotes} />
        <NavNotes notes={data.notes} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
