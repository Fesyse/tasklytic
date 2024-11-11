import { api } from "@/trpc/react"
import {
  Blocks,
  Calendar,
  FileIcon,
  Inbox,
  LayoutDashboard,
  MessageCircleQuestion,
  Presentation,
  Settings2,
  Sparkles
} from "lucide-react"
import Image from "next/image"
import { useParams, usePathname } from "next/navigation"
import { type FC } from "react"
import { type PROJECT_PLANS } from "./constants"

type LogoComponent = FC<{ className?: string }>

export type SidebarNav = {
  projects: {
    isLoading: boolean
    items:
      | {
          name: string
          logo: LogoComponent
          plan: (typeof PROJECT_PLANS)[number]
        }[]
      | undefined
  }
  navMain: ({
    title: string
    icon: LogoComponent
    isActive: boolean
  } & ({ href: string } | { action: () => void }))[]
  pinnedNotes: SidebarNav["notes"]
  notes: {
    isLoading: boolean
    items:
      | {
          name: string
          href: string
          emoji: LogoComponent
          isActive: boolean
        }[]
      | undefined
  }

  navSecondary: SidebarNav["navMain"]
}
export function useSidebarNav(): SidebarNav {
  const pathname = usePathname()
  const { projectId } = useParams<{ projectId: string }>()

  const { data: projects, isLoading: isProjectsLoading } =
    api.projects.getAll.useQuery(undefined, {
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
    projects: {
      isLoading: isProjectsLoading,
      items: projects?.map<
        NonNullable<SidebarNav["projects"]["items"]>[number]
      >(project => ({
        logo: project.icon
          ? props => (
              <Image
                src={project.icon!}
                alt={project.name}
                width={40}
                height={40}
                className={props.className}
              />
            )
          : Presentation,
        name: project.name,
        plan: project.plan
      }))
    },
    navMain: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        isActive: pathname.startsWith("/dashboard")
      },
      {
        title: "Ask AI",
        action: () => {},
        icon: Sparkles,
        isActive: false
      },
      {
        title: "Inbox",
        href: `/${projectId}/inbox`,
        icon: Inbox,
        isActive: pathname.startsWith(`/${projectId}/inbox`)
      }
    ],

    pinnedNotes: {
      isLoading: isPinnedNotesLoading,
      items: pinnedNotes?.map(note => {
        const href = `/project/${projectId}/${note.id}`
        return {
          name: note.title,
          emoji: FileIcon,
          href,
          isActive: pathname.startsWith(href)
        }
      })
    },
    notes: {
      isLoading: isNotesLoading,
      items: notes?.map(note => {
        const href = `/project/${projectId}/${note.id}`
        return {
          name: note.title,
          emoji: FileIcon,
          href,
          isActive: pathname.startsWith(href)
        }
      })
    },
    navSecondary: [
      {
        title: "Calendar",
        href: `/${projectId}/calendar`,
        icon: Calendar,
        isActive: pathname.startsWith(`/${projectId}/calendar`)
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings2,
        isActive: pathname.startsWith("/settings")
      },
      {
        title: "Templates",
        href: "/templates",
        icon: Blocks,
        isActive: pathname.startsWith("/templates")
      },
      {
        title: "Help",
        href: "/help",
        icon: MessageCircleQuestion,
        isActive: pathname.startsWith("/help")
      }
    ]
  }
}
