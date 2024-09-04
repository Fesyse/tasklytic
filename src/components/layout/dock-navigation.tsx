"use client"

import { FloatingDock } from "@/components/ui/floating-dock"
import { type Menu, useMenuList } from "@/lib/menu-list"
import { type Project } from "@/server/db/schema"

type DockNavigationProps = {
  projects: Project[] | null
}

export const DockNavigation = ({ projects }: DockNavigationProps) => {
  const menuList = useMenuList(projects)
  const items: Menu[] = menuList.map<Menu[]>(group => group.menus).flat()

  return (
    <FloatingDock
      desktopClassName="fixed bottom-2 left-1/2 -translate-x-1/2 z-50"
      mobileClassName="fixed bottom-2 left-2 z-50"
      items={items}
    />
  )
}
