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
import { useTranslations } from "next-intl"
import { authClient } from "./auth-client"
import type { Note } from "./db-client"
import { getNotes } from "./db-queries"
import { useSettingsDialog } from "./stores/settings-dialog"
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
  | {
      title: string
      action: () => void
      icon: LucideIcon
      isActive: boolean
      type: "action"
    }
export type NoteNavItem = {
  id: string
  title: string
  url: string
  icon: string | LucideIcon
  isFavorited: boolean

  subNotes:
    | {
        isLoading: boolean
        items: NoteNavItem[] | undefined
      }
    | undefined
}

type SidebarNav = {
  navMain: NavItem[]

  navSecondary: NavItem[]
} & (
  | {
      isNotesLoading: true
      favoriteNotes: undefined
      privateNotes: undefined
      sharedNotes: undefined
    }
  | {
      isNotesLoading: false
      favoriteNotes: NoteNavItem[]
      privateNotes: NoteNavItem[]
      sharedNotes: NoteNavItem[]
    }
)

export const useSidebarNav = (): SidebarNav => {
  const t = useTranslations("Dashboard.Sidebar")
  const { data: organization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()
  const { open: settingsDialogOpen, openSettingsDialog } = useSettingsDialog()

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
      isFavorited:
        note.isFavorited || note.favoritedByUserId === session?.user.id,
      subNotes: {
        isLoading: false,
        items: buildNoteHierarchy(notes, note.id)
      }
    }))
  }

  const isNotesLoading = result === undefined || !result.data

  return {
    navMain: [
      {
        title: t("NavMain.home"),
        url: "/dashboard",
        icon: HomeIcon,
        type: "url"
      },
      {
        title: t("NavMain.inbox"),
        url: "/dashboard/inbox",
        icon: InboxIcon,
        type: "url"
      }
    ],
    isNotesLoading,
    favoriteNotes: !isNotesLoading
      ? buildNoteHierarchy(
          result.data.filter((note) =>
            note.parentNoteId === null
              ? note.isFavorited && note.favoritedByUserId === session?.user.id
              : true
          ),
          null
        )
      : undefined,
    privateNotes: !isNotesLoading
      ? buildNoteHierarchy(
          result.data.filter((note) => !note.isPublic),
          null
        )
      : undefined,
    sharedNotes: !isNotesLoading
      ? buildNoteHierarchy(
          result.data.filter((note) => note.isPublic),
          null
        )
      : undefined,
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
        title: t("NavSecondary.calendar"),
        url: "/dashboard/calendar",
        icon: CalendarIcon,
        type: "url"
      },
      {
        title: t("NavSecondary.settings"),
        icon: SettingsIcon,
        action: openSettingsDialog.bind(null, undefined),
        isActive: settingsDialogOpen,
        type: "action"
      }
    ]
  }
}
