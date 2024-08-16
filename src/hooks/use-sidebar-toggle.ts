import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface useSidebarToggleStore {
  isOpen: boolean
  setIsOpen: () => void
}

export const useSidebarToggle = create(
  persist<useSidebarToggleStore>(
    (set, get) => {
      const setIsOpen = () => set({ isOpen: !get().isOpen })
      if (typeof window === "undefined") return { isOpen: false, setIsOpen }

      const sidebarStateFromStorage = localStorage.getItem("sidebarOpen")
      type SidebarStateFromStorage =
        | { state: useSidebarToggleStore }
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
