import { InvitationsDialog } from "@/components/layouts/dashboard/sidebar/invitations-dialog"
import { InvitePeopleDialog } from "@/components/layouts/dashboard/sidebar/invite-people-dialog"
import {
  CalendarIcon,
  HomeIcon,
  InboxIcon,
  SettingsIcon,
  type LucideIcon
} from "lucide-react"

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
export type NoteNavItem = NavItem & {
  emoji: string
}

type SidebarNav = {
  navMain: NavItem[]

  privateNotes: NoteNavItem[]
  sharedNotes?: NoteNavItem[]

  navSecondary: NavItem[]
}

export const useSidebarNav = (): SidebarNav => {
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
    privateNotes: [],
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
        url: "/dashboard/settings",
        icon: SettingsIcon,
        type: "url"
      }
    ]
  }
}
