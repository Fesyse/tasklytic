import {
  Blocks,
  Calendar,
  FileIcon,
  FolderIcon,
  Inbox,
  LayoutDashboard,
  MessageCircleQuestion,
  Presentation,
  Settings2
} from "lucide-react"
import Image from "next/image"
import { useParams, usePathname } from "next/navigation"
import React from "react"
import { AiDialog } from "@/components/layout/dashboard/sidebar/ai-dialog"
import type {
  Folder,
  FolderWithNotes,
  FolderWithSubFolders,
  Note
} from "@/server/db/schema"
import { api } from "@/trpc/react"

type LogoComponent = React.FC<{ className?: string }>

export type SidebarNote = {
  id: string
  name: string
  href: string
  emoji: React.ReactNode
  private: boolean
  isPinned: boolean
  isActive: boolean
} & { type: "note" }

export type SidebarFolder = {
  id: string
  name: string
  emoji: React.ReactNode
  folders?: SidebarFolder[]
  notes?: SidebarNote[]
} & { type: "folder" }

export type SidebarNav = {
  projects: {
    isProjectPage: boolean
    isLoading: boolean
    items:
      | {
          id: string
          name: string
          logo: LogoComponent
        }[]
      | undefined
  }
  navMain: (
    | ({
        title: string
        icon: LogoComponent
        isActive: boolean
      } & ({ href: string } | { action: () => void }))
    | { component: React.FC }
  )[]
  pinnedNotes: {
    isLoading: boolean
    items: SidebarNote[] | undefined
  }
  workspace: {
    items: (SidebarFolder | SidebarNote)[] | undefined
    isLoading: boolean
  }
  navSecondary: SidebarNav["navMain"]
}
export function useSidebarNav(): SidebarNav {
  const pathname = usePathname()
  const { projectId } = useParams<{
    projectId: string
  }>()

  const isProjectPage = projectId !== undefined

  const {
    data: projects,
    isLoading: isProjectsLoading,
    isError: isProjectsError
  } = api.projects.getAll.useQuery(undefined, {
    initialData: undefined
  })
  const { data: sidebar, isLoading: isSidebarLoading } =
    api.navigation.getSidebar.useQuery(
      { projectId },
      {
        enabled: isProjectPage,
        initialData: undefined
      }
    )

  return {
    projects: {
      isProjectPage: isProjectsError ? false : isProjectPage,
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
        name: project.name
      }))
    },
    navMain: [
      {
        title: "Dashboard",
        href: isProjectPage ? `/projects/${projectId}` : "/projects",
        icon: LayoutDashboard,
        isActive:
          pathname === (isProjectPage ? `/projects/${projectId}` : "/projects")
      },
      {
        component: AiDialog
      },
      {
        title: "Inbox",
        href: isProjectPage
          ? `/projects/${projectId}/inbox`
          : "/projects/dashboard/inbox",
        icon: Inbox,
        isActive: pathname.startsWith(
          isProjectPage
            ? `/projects/${projectId}/inbox`
            : "/projects/dashboard/inbox"
        )
      }
    ],

    pinnedNotes: {
      isLoading: isSidebarLoading,
      items: sidebar?.pinnedNotes
        ? transformNotes(sidebar.pinnedNotes, projectId, pathname)
        : undefined
    },
    workspace: {
      items:
        sidebar?.workspace && sidebar?.rootNotes
          ? [
              ...transformFolders(sidebar.workspace, projectId, pathname),
              ...transformNotes(sidebar.rootNotes, projectId, pathname)
            ]
          : undefined,
      isLoading: false
    },
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

function Emoji({
  emoji,
  type
}: {
  emoji: string | null
  type: "note" | "folder"
}) {
  return emoji ? (
    <span className="text-lg">{emoji}</span>
  ) : type === "note" ? (
    <FileIcon size={18} />
  ) : (
    <FolderIcon size={18} />
  )
}

export function transformNotes(
  notes: Note[],
  projectId: string,
  pathname: string
): SidebarNote[] {
  return notes.map<SidebarNote>(note => {
    const href = `/projects/${projectId}/note/${note.id}`
    return {
      id: note.id,
      name: note.title,
      emoji: <Emoji emoji={note.emoji} type="note" />,
      href,
      private: note.private,
      isPinned: note.isPinned,
      isActive: pathname.startsWith(href),
      type: "note"
    }
  })
}

export function transformFolders(
  folders: (
    | Folder
    | FolderWithNotes
    | FolderWithSubFolders
    | (FolderWithNotes & FolderWithSubFolders)
  )[],
  projectId: string,
  pathname: string
): SidebarFolder[] {
  return folders.map<SidebarFolder>(folder => {
    const href = `/projects/${projectId}/folder/${folder.id}`
    return {
      id: folder.id,
      name: folder.name,
      emoji: <Emoji emoji={folder.emoji} type="folder" />,
      href,
      isActive: pathname.startsWith(href),
      folders:
        "subFolders" in folder
          ? transformFolders(folder.subFolders, projectId, pathname)
          : undefined,
      notes:
        "notes" in folder
          ? transformNotes(folder.notes, projectId, pathname)
          : undefined,
      type: "folder"
    }
  })
}
