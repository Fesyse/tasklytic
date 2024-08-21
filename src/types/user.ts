type UserSettings = {
  sidebar: { isOpen: boolean; setIsOpen: () => void }
  navigationMenu: "sidebar" | "floating-dock"
}

export type { UserSettings }
