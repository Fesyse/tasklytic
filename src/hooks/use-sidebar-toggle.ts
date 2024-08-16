import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface UseSidebarToggleStore {
  isOpen: boolean
  setIsOpen: () => void
}

export const useSidebarToggle = create(
  persist<UseSidebarToggleStore>(
    (set, get) => {
      const setIsOpen = () => set({ isOpen: !get().isOpen })
      if (typeof window === "undefined") return { isOpen: false, setIsOpen }

      const sidebarStateFromStorage = localStorage.getItem("sidebarOpen")
      type SidebarStateFromStorage =
        | { state: UseSidebarToggleStore }
        | undefined
      return {
        isOpen: sidebarStateFromStorage
          ? !!(JSON.parse(sidebarStateFromStorage) as SidebarStateFromStorage)
              ?.state?.isOpen
          : true,
        setIsOpen
      }
    },
    {
      name: "sidebarOpen",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
