"use client"

import { FloatingDock } from "@/components/ui/floating-dock"
import { type Menu, useMenuList } from "@/lib/menu-list"
import { api } from "@/trpc/react"

export const DockNavigation = () => {
  const { data: projects, isLoading } = api.project.getAll.useQuery(undefined, {
    initialData: undefined
  })
  const menuList = useMenuList(projects, isLoading)
  const items: Menu[] = menuList.map<Menu[]>(group => group.menus).flat()

  return (
    <FloatingDock
      desktopClassName="fixed bottom-2 left-1/2 -translate-x-1/2 z-50"
      mobileClassName="fixed bottom-2 left-2 z-50"
      items={items}
    />
  )
}
