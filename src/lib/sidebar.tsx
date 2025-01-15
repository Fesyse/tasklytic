import {
  Blocks,
  Calendar,
  FileIcon,
  FolderIcon,
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
import { GetAllFoldersResponse } from "@/server/api/router/folder"
import { Folder, Note } from "@/server/db/schema"
import { api } from "@/trpc/react"

type LogoComponent = FC<{ className?: string }>

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
} & { type: "folder" }

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
    items: (SidebarFolder | SidebarNote)[] | undefined
    isLoading: boolean
  }
  navSecondary: SidebarNav["navMain"]
}
export function useSidebarNav(): SidebarNav {
  const pathname = usePathname()
  const { projectId, noteId } = useParams<{
    projectId: string
    noteId?: string
  }>()
  const isNotePage = noteId !== undefined

  const { data: projects, isLoading: isProjectsLoading } =
    api.projects.getAll.useQuery(undefined, {
      initialData: undefined
    })
  const { data: pinnedNotes, isLoading: isNotesLoading } =
    api.notes.getAllPinned.useQuery(
      { projectId },
      {
        enabled: isNotePage,
        initialData: undefined
      }
    )
  const { data: workspace } = api.folders.getAll.useQuery(
    { projectId },
    {
      enabled: isNotePage,
      initialData: undefined
    }
  )

  const folders = workspace ? extractFolders(workspace) : undefined
  const notes = workspace
    ? workspace.flatMap(folder => folder.notes)
    : undefined

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
      items: pinnedNotes
        ? transformNotes(pinnedNotes, projectId, pathname)
        : undefined
    },
    workspace: {
      items:
        folders && notes
          ? [
              ...transformFolders(folders, projectId, pathname),
              ...transformNotes(notes, projectId, pathname)
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

function extractFolders(folders: GetAllFoldersResponse) {
  const allFolders: Folder[] = []
  const nestedFolders: Folder[] = folders.flatMap(folder => folder.folders)

  nestedFolders.forEach(folder => allFolders.push(folder))

  for (const folder of folders) {
    allFolders.push({
      id: folder.id,
      name: folder.name,
      emoji: folder.emoji,
      projectId: folder.projectId,
      folderId: folder.folderId,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt
    })
  }

  return allFolders
}

function transformNotes(
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

function transformFolders(
  folders: Folder[],
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
      type: "folder"
    }
  })
}
