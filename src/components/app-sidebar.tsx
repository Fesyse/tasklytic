"use client"

import { NavMain } from "@/components/nav-main"
import { NavNotes } from "@/components/nav-notes"
import { NavPinnedNotes } from "@/components/nav-pinned-notes"
import { NavSecondary } from "@/components/nav-secondary"
import { ProjectSwitcher } from "@/components/project-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar"
import { useSidebarNav } from "@/lib/menu-list"

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
