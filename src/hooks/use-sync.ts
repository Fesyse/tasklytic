import { useCallback, useState } from "react"

import { useSyncContext } from "@/contexts/sync-context"
import { dexieDB } from "@/lib/db-client"
import { api } from "@/trpc/react"
import { useLiveQuery } from "dexie-react-hooks"

/**
 * Hook to use client-side data with server synchronization
 * This will:
 * 1. First load data from the client DB (fast)
 * 2. Then sync with the server in the background (reliable)
 * 3. Leverage React Query for caching and state management
 */
export function useSyncedNote(noteId: string) {
  const { syncStatus, syncNow, isInitialSyncComplete } = useSyncContext()
  const [error, setError] = useState<Error | null>(null)

  // Use React Query to invalidate related queries when needed
  const utils = api.useUtils()

  // Use Dexie's live query for automatic updates of client-side data
  const note = useLiveQuery(() => dexieDB.notes.get(noteId), [noteId])

  const blocks = useLiveQuery(
    () =>
      dexieDB.blocks
        .where("noteId")
        .equals(noteId)
        .toArray()
        .then((blocks) => blocks.sort((a, b) => a.order - b.order)),
    [noteId]
  )

  // Sync note with server and invalidate queries
  const syncWithServer = useCallback(async () => {
    if (!isInitialSyncComplete) return

    try {
      // This will trigger a full sync using the SyncContext
      await syncNow()

      // Invalidate related queries to ensure fresh data
      utils.sync.getBlocks.invalidate({ noteId })
      utils.sync.getDiscussions.invalidate({ noteId })
    } catch (err) {
      console.error("Error syncing note:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    }
  }, [isInitialSyncComplete, syncNow, noteId, utils])

  // Loading state is derived from both client and server data
  const isLoading = !note || (!blocks && isInitialSyncComplete)

  return {
    note: note || null,
    blocks: blocks || [],
    isLoading,
    error,
    syncStatus,
    syncWithServer
  }
}

/**
 * Hook to use synced notes for an organization
 */
export function useSyncedNotes(organizationId: string) {
  const { syncStatus, syncNow, isInitialSyncComplete } = useSyncContext()
  const [error, setError] = useState<Error | null>(null)

  // Use React Query utils
  const utils = api.useUtils()

  // Use Dexie's live query for automatic updates of client-side data
  const notes = useLiveQuery(
    () =>
      dexieDB.notes
        .where("organizationId")
        .equals(organizationId)
        .toArray()
        .then((notes) =>
          notes.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        ),
    [organizationId]
  )

  // Sync notes with server and invalidate queries
  const syncWithServer = useCallback(async () => {
    if (!isInitialSyncComplete) return

    try {
      // This will trigger a full sync using the SyncContext
      await syncNow()

      // Invalidate related queries to ensure fresh data
      utils.sync.getNotes.invalidate({ organizationId })
    } catch (err) {
      console.error("Error syncing notes:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    }
  }, [isInitialSyncComplete, syncNow, organizationId, utils])

  // Loading state is derived from client data
  const isLoading = !notes

  return {
    notes: notes ?? [],
    isLoading,
    error,
    syncStatus,
    syncWithServer
  }
}
