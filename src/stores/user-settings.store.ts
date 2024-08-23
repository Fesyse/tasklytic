import { createJSONStorage, persist } from "zustand/middleware"
import { createStore } from "zustand/vanilla"
import { UserSettings } from "@/types/user"
import { DeepPartial } from "@/types/utils"

export type UserSettingsStore = UserSettings & {
  sidebar: {
    setIsOpen: () => void
  }
}

export const defaultInitState = {
  navigationMenu: "floating-dock"
} satisfies DeepPartial<UserSettingsStore>

export const createUserSettingsStore = (initState = defaultInitState) => {
  return createStore(
    persist<UserSettingsStore>(
      (set, get) => {
        const setIsOpen = () => {
          const store = get()
          set({ sidebar: { ...store.sidebar, isOpen: !store.sidebar.isOpen } })
        }

        return {
          sidebar: { isOpen: false, setIsOpen },
          ...defaultInitState
        }
      },
      {
        name: "userSettings",
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
}
