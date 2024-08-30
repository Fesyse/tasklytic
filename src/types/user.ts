import { type NAVIGATION_MENU } from "@/lib/constants"

type UserSettings = {
  sidebar: { isOpen: boolean }
  navigationMenu: (typeof NAVIGATION_MENU)[number]
}

export type { UserSettings }
