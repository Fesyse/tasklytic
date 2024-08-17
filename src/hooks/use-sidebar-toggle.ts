import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface SidebarStore {
  isOpen: boolean
  setIsOpen: () => void
}

export const useSidebarToggle = create(
  persist<SidebarStore>(
    (set, get) => {
      const setIsOpen = () => set({ isOpen: !get().isOpen })
      if (typeof window === "undefined") return { isOpen: false, setIsOpen }

      const sidebarStateFromStorage = localStorage.getItem("sidebarOpen")
      type SidebarStateFromStorage = { state: SidebarStore } | undefined
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
