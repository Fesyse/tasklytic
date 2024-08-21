import { createJSONStorage, persist } from "zustand/middleware"
import { createStore } from "zustand/vanilla"
import { UserSettings } from "@/types/user"
import { DeepPartial } from "@/types/utils"

export const defaultInitState = {
  navigationMenu: "floating-dock"
} satisfies DeepPartial<UserSettings>

export const createUserSettingsStore = (initState = defaultInitState) => {
  return createStore(
    persist<UserSettings>(
      (set, get) => {
        const setIsOpen = () => {
          const store = get()
          set({ sidebar: { ...store.sidebar, isOpen: !store.sidebar.isOpen } })
        }
        return { sidebar: { isOpen: false, setIsOpen }, ...defaultInitState }
      },
      {
        name: "userSettings",
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
}
