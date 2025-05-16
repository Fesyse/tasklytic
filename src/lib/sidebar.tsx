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
import { dexieDB } from "./db-client"

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
  title: string
  url: string
  icon: string | LucideIcon
}

type SidebarNav = {
  navMain: NavItem[]

  privateNotes: { isLoading: boolean; items: NoteNavItem[] | undefined }
  sharedNotes: { isLoading: boolean; items: NoteNavItem[] | undefined }

  navSecondary: NavItem[]
}

export const useSidebarNav = (): SidebarNav => {
  const notes = useLiveQuery(() => dexieDB.notes.toArray(), [])

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
    privateNotes: {
      isLoading: notes === undefined,
      items:
        notes
          ?.filter((note) => !note.isPublic)
          .map<NoteNavItem>((note) => ({
            icon: note.emoji ?? FileIcon,
            title: note.title,
            url: `/dashboard/note/${note.id}`
          })) ?? []
    },
    sharedNotes: {
      isLoading: notes === undefined,
      items:
        notes
          ?.filter((note) => note.isPublic)
          .map<NoteNavItem>((note) => ({
            icon: note.emoji ?? FileIcon,
            title: note.title,
            url: `/dashboard/note/${note.id}`
          })) ?? []
    },
    navSecondary: [
      {
        component: <InvitationsDialog />,
        type: "component"
      },
      {
        component: <InvitePeopleDialog />,
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
