import { InvitationsDialog } from "@/components/layouts/dashboard/sidebar/invitations-dialog"
import { InvitePeopleDialog } from "@/components/layouts/dashboard/sidebar/invite-people-dialog"
import { useLiveQuery } from "dexie-react-hooks"
import {
  CalendarIcon,
  FileIcon,
  HomeIcon,
  InboxIcon,
  SettingsIcon,
  type LucideIcon
} from "lucide-react"
import { authClient } from "./auth-client"
import type { Note } from "./db-client"
import { getNotes } from "./db-queries"
import { tryCatch } from "./utils"

export type NavItem =
  | {
      title: string
      url: string
      icon: LucideIcon
      type: "url"
    }
  | {
      component: React.JSX.Element
      type: "component"
    }
export type NoteNavItem = {
  id: string
  title: string
  url: string
  icon: string | LucideIcon

  subNotes:
    | {
        isLoading: boolean
        items: NoteNavItem[] | undefined
      }
    | undefined
}

type SidebarNav = {
  navMain: NavItem[]

  favoriteNotes: { isLoading: boolean; items: NoteNavItem[] | undefined }
  privateNotes: { isLoading: boolean; items: NoteNavItem[] | undefined }
  sharedNotes: { isLoading: boolean; items: NoteNavItem[] | undefined }

  navSecondary: NavItem[]
}

export const useSidebarNav = (): SidebarNav => {
  const { data: organization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()
  const result = useLiveQuery(() => {
    if (!organization?.id) return tryCatch(Promise.resolve([]))
    return getNotes(organization.id)
  }, [organization?.id])

  // Helper function to build the note hierarchy
  const buildNoteHierarchy = (
    notes: Note[] | undefined,
    parentNoteId: string | null = null
  ): NoteNavItem[] => {
    if (!notes) return []

    // Get all notes with the specified parentNoteId
    const filteredNotes = notes.filter(
      (note) => note.parentNoteId === parentNoteId
    )

    return filteredNotes.map<NoteNavItem>((note) => ({
      id: note.id,
      icon: note.emoji ?? FileIcon,
      title: note.title,
      url: `/dashboard/note/${note.id}`,
      subNotes: {
        isLoading: false,
        items: buildNoteHierarchy(notes, note.id)
      }
    }))
  }

  return {
    navMain: [
      {
        title: "Home",
        url: "/dashboard",
        icon: HomeIcon,
        type: "url"
      },
      {
        title: "Inbox",
        url: "/dashboard/inbox",
        icon: InboxIcon,
        type: "url"
      }
    ],
    favoriteNotes: {
      isLoading: result === undefined || !result.data,
      items: result?.data
        ? buildNoteHierarchy(
            result.data.filter(
              (note) =>
                note.isFavorited && note.favoritedByUserId === session?.user.id
            ),
            null
          )
        : []
    },
    privateNotes: {
      isLoading: result === undefined || !result.data,
      items: result?.data
        ? buildNoteHierarchy(
            result.data.filter(
              (note) =>
                !note.isPublic &&
                (!note.isFavorited ||
                  note.favoritedByUserId !== session?.user.id)
            ),
            null
          )
        : []
    },
    sharedNotes: {
      isLoading: result === undefined || !result.data,
      items: result?.data
        ? buildNoteHierarchy(
            result.data.filter(
              (note) =>
                note.isPublic &&
                (!note.isFavorited ||
                  note.favoritedByUserId !== session?.user.id)
            ),
            null
          )
        : []
    },
    navSecondary: [
      {
        component: <InvitationsDialog key="invitations-dialog" />,
        type: "component"
      },
      {
        component: <InvitePeopleDialog key="invite-people-dialog" />,
        type: "component"
      },
      {
        title: "Calendar",
        url: "/dashboard/calendar",
        icon: CalendarIcon,
        type: "url"
      },
      {
        title: "Settings",
        url: "/settings",
        icon: SettingsIcon,
        type: "url"
      }
    ]
  }
}
