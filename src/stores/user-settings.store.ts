import { create } from "zustand"
import { persist } from "zustand/middleware"
import { UserSettings } from "@/types/user"
import { DeepPartial } from "@/types/utils"

export type UserSettingsStore = UserSettings & {
  sidebar: {
    setIsOpen: () => void
  }
  updateUserSettingsStore: (settings: DeepPartial<UserSettings>) => void
}

export const defaultInitState = {
  navigationMenu: "floating-dock"
} satisfies DeepPartial<UserSettingsStore>

export const useUserSettingsStore = create(
  persist<UserSettingsStore>(
    (set, get) => {
      const setIsOpen = () => {
        const store = get()
        set({ sidebar: { ...store.sidebar, isOpen: !store.sidebar.isOpen } })
      }

      return {
        sidebar: { isOpen: false, setIsOpen },
        updateUserSettingsStore: (settings: DeepPartial<UserSettings>) => {
          const store = get()
          set({
            ...store,
            ...settings,
            sidebar: { ...store.sidebar, ...settings.sidebar }
          })
        },
        ...defaultInitState
      }
    },
    {
      name: "userSettings"
    }
  )
)
