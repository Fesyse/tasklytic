"use client"

import { type ReactNode, createContext, useContext, useRef } from "react"
import { useStore } from "zustand"
import { UserSettings } from "@/types/user"
import { createUserSettingsStore } from "@/stores/user-settings.store"

export type UserSettingsStoreApi = ReturnType<typeof createUserSettingsStore>

export const UserSettingsStoreContext = createContext<
  UserSettingsStoreApi | undefined
>(undefined)

export interface UserSettingsStoreProviderProps {
  children: ReactNode
}

export const UserSettingsStoreProvider = ({
  children
}: UserSettingsStoreProviderProps) => {
  const storeRef = useRef<UserSettingsStoreApi>()
  if (!storeRef.current) {
    storeRef.current = createUserSettingsStore()
  }

  return (
    <UserSettingsStoreContext.Provider value={storeRef.current}>
      {children}
    </UserSettingsStoreContext.Provider>
  )
}

export const useUserSettingsStore = <T,>(
  selector: (store: UserSettings) => T
): T => {
  const userSettingsStoreContext = useContext(UserSettingsStoreContext)

  if (!userSettingsStoreContext) {
    throw new Error(
      `useUserSettingsStore must be used within UserSettingsStoreProvider`
    )
  }

  return useStore(userSettingsStoreContext, selector)
}
