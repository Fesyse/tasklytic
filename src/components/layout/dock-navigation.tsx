"use client"

import { usePathname } from "next/navigation"
import { FloatingDock } from "../ui/floating-dock"
import { type Menu, getMenuList } from "@/lib/menu-list"

export const DockNavigation = () => {
  const pathname = usePathname()
  const menuList = getMenuList(pathname)
  const items: Menu[] = menuList.map<Menu[]>(group => group.menus).flat()

  return (
    <FloatingDock
      desktopClassName="fixed bottom-2 left-1/2 -translate-x-1/2 z-50"
      mobileClassName="fixed bottom-2 left-2 z-50"
      items={items}
    />
  )
}
