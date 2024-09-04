import { LayoutDashboard, type LucideIcon, Plus, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import { type MouseEventHandler, forwardRef } from "react"
import { cn, getProjectsFromLocalStorage } from "./utils"
import { type Project } from "@/server/db/schema"

type _Submenu = {
  label: string
  active: boolean
  icon: LucideIcon
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

export function useMenuList(projects: Project[] | null): Group[] {
  const pathname = usePathname()
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
              icon: Plus,
              label: "Create new project"
            },
            ...(projects ?? projectsFromLocalStorage).map<Submenu>(project => ({
              href: `/projects/${project.id}`,
              active: pathname.startsWith(`/projects/${project.id}`),
              icon: getProjectIcon(project.name),
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

const getProjectIcon = (projectName: string): LucideIcon => {
  const letter = projectName[0]!.toUpperCase()
  const ProjectIcon: LucideIcon = forwardRef(({ className }, _ref) => {
    return (
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center text-lg",
          className
        )}
      >
        {letter}
      </div>
    )
  })

  ProjectIcon.displayName = "ProjectIcon"

  return ProjectIcon
}
