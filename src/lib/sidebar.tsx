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
}

type SidebarNav = {
  navMain: NavItem[]

  privateNotes: { isLoading: boolean; items: NoteNavItem[] | undefined }
  sharedNotes: { isLoading: boolean; items: NoteNavItem[] | undefined }

  navSecondary: NavItem[]
}

export const useSidebarNav = (): SidebarNav => {
  const { data: organization } = authClient.useActiveOrganization()
  const result = useLiveQuery(() => {
    if (!organization?.id) return tryCatch(Promise.resolve([]))
    return getNotes(organization.id)
  }, [organization?.id])

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
      isLoading: result === undefined || !result.data,
      items:
        result?.data
          ?.filter((note) => !note.isPublic)
          .map<NoteNavItem>((note) => ({
            id: note.id,
            icon: note.emoji ?? FileIcon,
            title: note.title,
            url: `/dashboard/note/${note.id}`
          })) ?? []
    },
    sharedNotes: {
      isLoading: result === undefined || !result.data,
      items:
        result?.data
          ?.filter((note) => note.isPublic)
          .map<NoteNavItem>((note) => ({
            id: note.id,
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
