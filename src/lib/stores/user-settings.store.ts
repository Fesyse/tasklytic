import { createJSONStorage, persist } from "zustand/middleware"
import { createStore } from "zustand/vanilla"
import { type UserSettings } from "@/types/user"
import { type DeepPartial } from "@/types/utils"

export type UserSettingsStore = UserSettings & {
  setIsSidebarOpen: () => void
  updateUserSettingsStore: (settings: DeepPartial<UserSettings>) => void
}

export const defaultInitState = {} satisfies DeepPartial<UserSettingsStore>

export const createUserSettingsStore = (initState = defaultInitState) => {
  return createStore(
    persist<UserSettingsStore>(
      (set, get) => {
        const setIsSidebarOpen = () => {
          const store = get()
          set({ sidebar: { ...store.sidebar, isOpen: !store.sidebar.isOpen } })
        }

        return {
          sidebar: { isOpen: false },
          setIsSidebarOpen,
          updateUserSettingsStore: (settings: DeepPartial<UserSettings>) => {
            const store = get()
            set({
              ...store,
              ...settings,
              sidebar: { ...store.sidebar, ...settings.sidebar }
            })
          },
          ...initState
        }
      },
      {
        name: "userSettings",
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
}
