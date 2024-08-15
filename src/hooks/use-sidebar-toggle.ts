import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface useSidebarToggleStore {
  isOpen: boolean
  setIsOpen: () => void
}

export const useSidebarToggle = create(
  persist<useSidebarToggleStore>(
    (set, get) => {
      const sidebarStateFromStorage = localStorage.getItem("sidebarOpen")
      return {
        isOpen: sidebarStateFromStorage
          ? JSON.parse(sidebarStateFromStorage)?.state?.isOpen
          : true,
        setIsOpen: () => {
          set({ isOpen: !get().isOpen })
        }
      }
    },
    {
      name: "sidebarOpen",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
