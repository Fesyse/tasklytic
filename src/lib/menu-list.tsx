import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import {
  Blocks,
  Calendar,
  FileIcon,
  Inbox,
  MessageCircleQuestion,
  Presentation,
  Settings2,
  Sparkles,
  type LucideIcon
} from "lucide-react"
import Image from "next/image"
import { useParams, usePathname } from "next/navigation"
import React, { forwardRef } from "react"
import { type PROJECT_PLANS } from "./constants"

export type SidebarNav = {
  projects:
    | {
        name: string
        logo: React.ReactNode
        plan: (typeof PROJECT_PLANS)[number]
      }[]
    | undefined
  navMain: ({
    title: string
    icon: React.ReactNode
    isActive: boolean
  } & ({ href: string } | { action: () => void }))[]
  pinnedNotes:
    | {
        name: string
        href: string
        emoji: React.ReactNode
        isActive: boolean
      }[]
    | undefined
  notes:
    | {
        name: string
        href: string
        emoji: React.ReactNode
        isActive: boolean
      }[]
    | undefined

  navSecondary: {
    title: string
    href: string
    icon: React.ReactNode
    isActive: boolean
  }[]
}
export function useSidebarNav(): SidebarNav {
  const pathname = usePathname()
  const { projectId } = useParams<{ projectId: string }>()

  const { data: projects } = api.projects.getAll.useQuery(undefined, {
    initialData: []
  })

  const { data: notes, isLoading: isNotesLoading } = api.notes.getAll.useQuery(
    { projectId },
    {
      initialData: undefined
    }
  )
  const { data: pinnedNotes, isLoading: isPinnedNotesLoading } =
    api.notes.getAll.useQuery(
      { projectId },
      {
        initialData: undefined
      }
    )

  return {
    projects: projects?.map(project => ({
      logo: project.icon ? (
        <Image src={project.icon} alt={project.name} width={40} height={40} />
      ) : (
        <Presentation />
      ),
      name: project.name,
      plan: project.plan
    })),
    navMain: [
      {
        title: "Dashboard",
        icon: "/dashboard",
        isActive: pathname.startsWith("/dashboard"),
        href: "/dashboard"
      },
      {
        title: "Ask AI",
        action: () => {},
        icon: <Sparkles />,
        isActive: false
      },
      {
        title: "Inbox",
        href: `/${projectId}/inbox`,
        icon: <Inbox />,
        isActive: pathname.startsWith(`/${projectId}/inbox`)
      }
    ],

    pinnedNotes: pinnedNotes?.map(note => {
      const href = `/project/${projectId}/${note.id}`
      return {
        name: note.title,
        emoji: <FileIcon />,
        href,
        isActive: pathname.startsWith(href)
      }
    }),
    notes: notes?.map(note => {
      const href = `/project/${projectId}/${note.id}`
      return {
        name: note.title,
        emoji: <FileIcon />,
        href,
        isActive: pathname.startsWith(href)
      }
    }),
    navSecondary: [
      {
        title: "Calendar",
        href: `/${projectId}/calendar`,
        icon: <Calendar />,
        isActive: pathname.startsWith(`/${projectId}/calendar`)
      },
      {
        title: "Settings",
        href: "/settings",
        icon: <Settings2 />,
        isActive: pathname.startsWith("/settings")
      },
      {
        title: "Templates",
        href: "/templates",
        icon: <Blocks />,
        isActive: pathname.startsWith("/templates")
      },
      {
        title: "Help",
        href: "/help",
        icon: <MessageCircleQuestion />,
        isActive: pathname.startsWith("/help")
      }
    ]
  }
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
