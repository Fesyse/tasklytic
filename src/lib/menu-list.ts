import { LayoutDashboard, type LucideIcon, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import { type MouseEventHandler } from "react"
import { getProjectsFromLocalStorage } from "./utils"
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
  const projectsFromLocalStorage = getProjectsFromLocalStorage()

  return [
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "/projects",
          label: "Projects",
          active: pathname.startsWith("/projects"),
          icon: LayoutDashboard,
          submenus: [
            {
              href: "/create-project",
              active: pathname.startsWith("/create-project"),
              label: "Create new project"
            },
            ...(projects ?? projectsFromLocalStorage).map<Submenu>(project => ({
              href: `/projects/${project.id}`,
              active: pathname.startsWith(`/projects/${project.id}`),
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
