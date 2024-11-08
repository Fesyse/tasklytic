import { isCuid, cn } from "@/lib/utils"
import {
  FileIcon,
  LayoutDashboard,
  type LucideIcon,
  Plus,
  Settings
} from "lucide-react"
import { usePathname } from "next/navigation"
import React, { type MouseEventHandler, forwardRef, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
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
  const splittedPathname = pathname.split("/").slice(1)
  const isProjectPage =
    splittedPathname[0] === "projects" && splittedPathname[1]
      ? isCuid(splittedPathname[1])
      : false

  /** Use only if isProjectPage checks */
  const projectId = isProjectPage ? splittedPathname[1]! : undefined

  const { data: projectNotes, isLoading: isProjectNotesLoading } =
    api.notes.getAll.useQuery(
      {
        projectId: splittedPathname[1]!
      },
      {
        enabled: isProjectPage,
        initialData: undefined
      }
    )
  const { data: projects } = api.projects.getAll.useQuery(undefined, {
    initialData: []
  })

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
    ...(isProjectPage
      ? [
          {
            groupLabel: "Notes",
            menus:
              projectNotes && !isProjectNotesLoading
                ? projectNotes.map(note => {
                    const href = `/project/${projectId}/${note.id}`
                    return {
                      active: pathname.startsWith(href),
                      icon: FileIcon,
                      label: note.title,
                      href,
                      submenus: []
                    }
                  })
                : []
          } satisfies Group
        ]
      : []),
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
