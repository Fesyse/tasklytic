import { LayoutDashboard, type LucideIcon, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import { type MouseEventHandler } from "react"
import { api } from "@/trpc/react"

type _Submenu = {
  label: string
  active: boolean
}

export type Submenu = _Submenu &
  (
    | {
        href: string
      }
    | { action: MouseEventHandler<HTMLButtonElement> }
  )

type _Menu = {
  label: string
  active: boolean
  icon: LucideIcon
  submenus: Submenu[]
}

export type Menu = (
  | {
      href: string
    }
  | {
      action: MouseEventHandler<HTMLButtonElement>
    }
) &
  _Menu

type Group = {
  groupLabel: string
  className?: string
  menus: Menu[]
}

export function useMenuList(): Group[] {
  const pathname = usePathname()
  const { data: projects } = api.project.getAll.useQuery(undefined, {
    initialData: []
  })

  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.startsWith("/dashboard"),
          icon: LayoutDashboard,
          submenus: [
            {
              href: "/dashboard/create-project",
              active: pathname.startsWith("/dashboard/create-project"),
              label: "Create new project"
            },
            ...(projects ?? []).map<Submenu>(project => ({
              href: `/project/${project.id}`,
              active: pathname.startsWith(`/project/${project.id}`),
              label: project.name
            }))
          ]
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
