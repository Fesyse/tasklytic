"use client"

import { createContext, useContext, useRef } from "react"
import { useStore } from "zustand"
import {
  type UserSettingsStore,
  createUserSettingsStore
} from "@/lib/stores/user-settings.store"

export type UserSettingsStoreApi = ReturnType<typeof createUserSettingsStore>

export const UserSettingsStoreContext = createContext<
  UserSettingsStoreApi | undefined
>(undefined)

export const UserSettingsStoreProvider = ({
  children
}: React.PropsWithChildren) => {
  const storeRef = useRef<UserSettingsStoreApi>(null)
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
  selector: (store: UserSettingsStore) => T
): T => {
  const userSettingsStoreContext = useContext(UserSettingsStoreContext)

  if (!userSettingsStoreContext) {
    throw new Error(
      `useUserSettingsStore must be used within UserSettingsStoreProvider`
    )
  }

  return useStore(userSettingsStoreContext, selector)
}
