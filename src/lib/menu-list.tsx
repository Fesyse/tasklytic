import { isCuid } from "@paralleldrive/cuid2"
import { LayoutDashboard, type LucideIcon, Plus, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import React, { type MouseEventHandler, forwardRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, getProjectsFromLocalStorage } from "./utils"
import { api } from "@/trpc/react"

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
  groupLabel?: React.ReactNode
  className?: string
  menus: Menu[]
}

export function useMenuList(): Group[] {
  const pathname = usePathname()
  const splittedPathname = pathname.split("/")
  const isProjectPage =
    splittedPathname[0] === "project" && splittedPathname[1]
      ? isCuid(splittedPathname[1])
      : false

  const { data: project, isLoading: isProjectLoading } =
    api.project.getById.useQuery(
      { id: isProjectPage ? splittedPathname[1]! : `${Math.random()}` },
      {
        initialData: undefined
      }
    )
  const { data: _projects, isLoading: isProjectsLoading } =
    api.project.getAll.useQuery(undefined, {
      initialData: []
    })
  const projects =
    isProjectsLoading && !_projects.length
      ? []
      : (_projects ?? getProjectsFromLocalStorage())

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
            ...projects.map<Submenu>(project => ({
              href: `/projects/${project.id}`,
              active: pathname.startsWith(`/projects/${project.id}`),
              icon: getProjectIcon(project.name),
              label: project.name
            }))
          ]
        }
      ]
    },
    isProjectPage
      ? ({
          groupLabel: project ? (
            project.name
          ) : (
            <Skeleton className="h-8 w-full" />
          ),
          menus: []
        } satisfies Group)
      : undefined,
    {
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
  ].filter(m => !!m)
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
