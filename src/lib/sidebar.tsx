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
import { api } from "@/trpc/react"

type LogoComponent = FC<{ className?: string }>

export type SidebarNote = {
  id: string
  name: string
  href: string
  emoji: LogoComponent
  private: boolean
  isPinned: boolean
  isActive: boolean
}

export type SidebarFolder = {
  id: string
  name: string
  emoji: LogoComponent
  href: string
  isActive: boolean
}

export type SidebarNav = {
  projects: {
    isLoading: boolean
    items:
      | {
          id: string
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
  pinnedNotes: {
    isLoading: boolean
    items: SidebarNote[] | undefined
  }
  workspace: {
    items: (
      | (SidebarFolder & { type: "folder" })
      | (SidebarNote & { type: "note" })
    )[]
    isLoading: boolean
  }
  navSecondary: SidebarNav["navMain"]
}
export function useSidebarNav(): SidebarNav {
  const pathname = usePathname()
  const { projectId } = useParams<{ projectId: string }>()

  const { data: projects, isLoading: isProjectsLoading } =
    api.projects.getAll.useQuery(undefined, {
      initialData: undefined
    })

  const { data: pinnedNotes, isLoading: isNotesLoading } =
    api.notes.getAllPinned.useQuery(
      { projectId },
      {
        enabled: !!projectId,
        initialData: undefined
      }
    )

  return {
    projects: {
      isLoading: isProjectsLoading,
      items: projects?.map<
        NonNullable<SidebarNav["projects"]["items"]>[number]
      >(project => ({
        id: project.id,
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
        href: `/projects/${projectId}`,
        icon: LayoutDashboard,
        isActive: pathname === `/projects/${projectId}`
      },
      {
        title: "Ask AI",
        action: () => {},
        icon: Sparkles,
        isActive: false
      },
      {
        title: "Inbox",
        href: `/projects/${projectId}/inbox`,
        icon: Inbox,
        isActive: pathname.startsWith(`/projects/${projectId}/inbox`)
      }
    ],

    pinnedNotes: {
      isLoading: isNotesLoading,
      items: pinnedNotes?.map(note => {
        const href = `/projects/${projectId}/note/${note.id}`
        return {
          id: note.id,
          name: note.title,
          emoji: () =>
            note.emoji ? (
              <span className="text-lg">{note.emoji}</span>
            ) : (
              <FileIcon size={18} />
            ),
          href,
          private: note.private,
          isPinned: note.isPinned,
          isActive: pathname.startsWith(href)
        }
      })
    },
    workspace: { items: [], isLoading: false },
    navSecondary: [
      {
        title: "Calendar",
        href: `/projects/${projectId}/calendar`,
        icon: Calendar,
        isActive: pathname.startsWith(`/projects/${projectId}/calendar`)
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
