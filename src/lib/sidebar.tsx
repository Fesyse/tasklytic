import {
  CalendarIcon,
  HomeIcon,
  InboxIcon,
  SettingsIcon,
  type LucideIcon
} from "lucide-react"

type Nav = {
  title: string
  url: string
  icon: LucideIcon
}

type NoteNav = Nav & {
  emoji: string
}

type SidebarNav = {
  navMain: Nav[]
  privateNotes: NoteNav[]
  sharedNotes?: NoteNav[]
  navSecondary: Nav[]
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
