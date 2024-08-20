import { LayoutDashboard, type LucideIcon, Settings } from "lucide-react"

type Submenu = {
  href: string
  label: string
  active: boolean
}

type Menu = {
  href: string
  label: string
  active: boolean
  icon: LucideIcon
  submenus: Submenu[]
}

type Group = {
  groupLabel: string
  className?: string
  menus: Menu[]
}

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.startsWith("/dashboard"),
          icon: LayoutDashboard,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      className: "grow flex items-end",
      menus: [
        {
          href: "/settings",
          label: "Settings",
          icon: Settings,
          active: pathname.startsWith("/settings"),
          submenus: []
        }
      ]
    }
  ]
}
