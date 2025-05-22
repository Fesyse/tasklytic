"use client"

import { useSync } from "@/hooks/use-sync"
import { type SyncStatus } from "@/lib/sync-service"
import { createContext, useContext, type ReactNode } from "react"

// Define the context type
interface SyncContextType {
  syncStatus: SyncStatus
  lastSyncedAt: Date | null
  syncNow: () => Promise<any>
  isSyncingSpecificNote: boolean
  pullNoteFromServer: (noteId: string) => Promise<any>
}

// Create the context with default values
const SyncContext = createContext<SyncContextType>({
  syncStatus: "idle",
  lastSyncedAt: null,
  syncNow: async () => {
    console.error("SyncProvider not initialized")
    return { success: false, error: new Error("SyncProvider not initialized") }
  },
  isSyncingSpecificNote: false,
  pullNoteFromServer: async () => {
    console.error("SyncProvider not initialized")
    return { success: false, error: new Error("SyncProvider not initialized") }
  }
})

// Hook to use the sync context
export const useSyncContext = () => useContext(SyncContext)

/**
 * Database synchronization provider that connects Dexie client DB with server Drizzle DB
 * Wrap your application with this provider to enable automatic sync capabilities
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  // Use our custom hook that provides sync functionality
  // This is now properly using React hooks pattern
  const {
    syncStatus,
    lastSyncedAt,
    syncNow,
    isSyncingSpecificNote,
    pullNoteFromServer
  } = useSync()

  return (
    <SyncContext.Provider
      value={{
        syncStatus,
        lastSyncedAt,
        syncNow,
        isSyncingSpecificNote,
        pullNoteFromServer
      }}
    >
      {children}
    </SyncContext.Provider>
  )
}
