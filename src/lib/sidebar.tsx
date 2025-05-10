import {
  CalendarIcon,
  HomeIcon,
  InboxIcon,
  SettingsIcon,
  type LucideIcon
} from "lucide-react"

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
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
        icon: HomeIcon
      },
      {
        title: "Inbox",
        url: "/dashboard/inbox",
        icon: InboxIcon
      }
    ],
    privateNotes: [],
    navSecondary: [
      {
        title: "Calendar",
        url: "/dashboard/calendar",
        icon: CalendarIcon
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: SettingsIcon
      }
    ]
  }
}
