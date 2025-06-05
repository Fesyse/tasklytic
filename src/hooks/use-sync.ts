/**
 * NOTE: There are TypeScript errors in the sync-service.ts file related to the tRPC API calls.
 * The SyncService class is calling methods that don't exist according to TypeScript.
 * This is likely due to a mismatch between the expected tRPC API and what's actually available.
 * The team should review the tRPC setup and ensure the API client is correctly typed.
 * For now, we've implemented these hooks to keep the application working but the underlying issue needs to be addressed.
 */

import { useObservable } from "@/hooks/use-observable"
import { authClient } from "@/lib/auth-client"
import { dexieDB } from "@/lib/db-client"
import {
  createSyncService,
  type SyncResult,
  type SyncStatus
} from "@/lib/sync-service"
import { apiVanilla } from "@/trpc/vanilla-client"
import { useQueryClient } from "@tanstack/react-query"
import { liveQuery } from "dexie"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

/**
 * Hook for interacting with the sync service
 */
export function useSync() {
  const { noteId } = useParams<{ noteId: string }>()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const [isSyncingSpecificNote, setIsSyncingSpecificNote] = useState(false)

  const queryClient = useQueryClient()
  const { data: activeOrganization } = authClient.useActiveOrganization()

  // Create the sync service instance with the utils
  // This is a ref to avoid recreating the service on each render
  const syncServiceRef = useRef(createSyncService(apiVanilla))

  // Track if a sync operation is currently running (mutex)
  const syncInProgressRef = useRef(false)

  // Update the sync service instance when utils change
  useEffect(() => {
    syncServiceRef.current = createSyncService(apiVanilla)

    // Update state with current values from service
    setSyncStatus(syncServiceRef.current.status)
    setLastSyncedAt(syncServiceRef.current.lastSyncedAt)
  }, [apiVanilla])

  /**
   * Sync all data between local DB and server
   */
  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (syncInProgressRef.current) {
      return { success: false, error: new Error("Sync already in progress") }
    }

    syncInProgressRef.current = true
    setSyncStatus("syncing")

    try {
      const result = await syncServiceRef.current.syncAll(noteId)

      setLastSyncedAt(syncServiceRef.current.lastSyncedAt)

      return result
    } catch (error) {
      setSyncStatus("error")
      toast.error("Sync failed. Please try again.")
      return { success: false, error: error as Error }
    } finally {
      setSyncStatus("idle")
      syncInProgressRef.current = false
    }
  }, [])

  const syncNotes = useCallback(async (): Promise<SyncResult> => {
    if (syncInProgressRef.current) {
      return { success: false, error: new Error("Sync already in progress") }
    }

    syncInProgressRef.current = true
    setSyncStatus("syncing")

    if (!activeOrganization?.id) {
      return { success: false, error: new Error("No active organization") }
    }

    try {
      const result = await syncServiceRef.current.syncNotes(
        activeOrganization.id
      )

      setLastSyncedAt(syncServiceRef.current.lastSyncedAt)

      return result
    } catch (error) {
      setSyncStatus("error")
      toast.error("Sync failed. Please try again.")
      return { success: false, error: error as Error }
    } finally {
      setSyncStatus("idle")
      syncInProgressRef.current = false
    }
  }, [])

  /**
   * Pull a specific note from the server
   */
  const pullNoteFromServer = useCallback(
    async (noteId: string): Promise<SyncResult> => {
      if (!activeOrganization?.id) {
        return { success: false, error: new Error("No active organization") }
      }

      setIsSyncingSpecificNote(true)
      setSyncStatus("syncing")

      try {
        const result = await syncServiceRef.current.pullNoteFromServer(
          noteId,
          activeOrganization.id
        )

        if (result.success) {
          queryClient.invalidateQueries({
            queryKey: ["note", noteId, activeOrganization.id]
          })
        } else {
          toast.error("Failed to fetch note from server")
        }

        return result
      } catch (error) {
        toast.error("Error syncing note from server")
        setSyncStatus("error")
        return { success: false, error: error as Error }
      } finally {
        setIsSyncingSpecificNote(false)
        setSyncStatus("idle")
      }
    },
    [activeOrganization?.id, queryClient]
  )

  // Set up periodic sync
  useEffect(() => {
    // Set up periodic sync (every 5 minutes)
    const intervalId = setInterval(
      () => {
        if (activeOrganization?.id && !syncInProgressRef.current) {
          syncNow().catch(console.error)
        }
      },
      5 * 60 * 1000
    )

    return () => clearInterval(intervalId)
  }, [activeOrganization?.id, syncNow])

  return {
    syncStatus,
    lastSyncedAt,
    isSyncingSpecificNote,
    syncNow,
    syncNotes,
    pullNoteFromServer
  }
}

/**
 * Hook for observing and syncing a single note
 * @param noteId The ID of the note to observe
 */
export function useSyncedNote(noteId: string) {
  const { syncStatus, pullNoteFromServer } = useSync()
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { data: activeOrganization } = authClient.useActiveOrganization()

  // Use Dexie's liveQuery to reactively observe the note
  const note = useObservable(
    () => liveQuery(() => dexieDB.notes.get(noteId)),
    [noteId]
  )

  // Use liveQuery to observe blocks for this note
  const blocks = useObservable(
    () =>
      liveQuery(() =>
        dexieDB.blocks
          .where("noteId")
          .equals(noteId)
          .toArray()
          .then((blocks) => blocks.sort((a, b) => a.order - b.order))
      ),
    [noteId]
  )

  // If the note is not found in local DB, attempt to fetch from server
  useEffect(() => {
    const fetchNoteIfNeeded = async () => {
      setIsLoading(true)
      try {
        // Check if note exists locally
        const existingNote = await dexieDB.notes.get(noteId)

        // If not found locally and we have an organization ID, try fetching from server
        if (!existingNote && activeOrganization?.id) {
          const result = await pullNoteFromServer(noteId)

          if (!result.success) {
            setError(
              (result.error as Error) || new Error("Failed to fetch note")
            )
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error loading note"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchNoteIfNeeded()
  }, [noteId, activeOrganization?.id, pullNoteFromServer])

  return {
    note,
    blocks,
    isLoading,
    error,
    syncStatus
  }
}

/**
 * Hook for observing and syncing all notes for an organization
 * @param organizationId The ID of the organization
 */
export function useSyncedNotes(organizationId: string) {
  const { syncStatus, syncNow } = useSync()
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Use Dexie's liveQuery to reactively observe all notes for the organization
  const notes = useObservable(
    () =>
      liveQuery(() =>
        dexieDB.notes.where("organizationId").equals(organizationId).toArray()
      ),
    [organizationId]
  )

  // Initial data fetch
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true)
      try {
        // Check if we have notes locally
        const existingNotes = await dexieDB.notes
          .where("organizationId")
          .equals(organizationId)
          .count()

        // If no notes found locally, sync with server
        if (existingNotes === 0) {
          await syncNow()
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error loading notes"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [organizationId, syncNow])

  return {
    notes,
    isLoading,
    error,
    syncStatus
  }
}
