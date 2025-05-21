"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react"

import { authClient } from "@/lib/auth-client"
import { dexieDB } from "@/lib/db-client"
import { api } from "@/trpc/react"

type SyncStatus = "idle" | "syncing" | "error" | "success"

interface SyncContextType {
  syncStatus: SyncStatus
  lastSyncedAt: Date | null
  syncNow: () => Promise<void>
  isInitialSyncComplete: boolean
}

// Default context value
const defaultContext: SyncContextType = {
  syncStatus: "idle",
  lastSyncedAt: null,
  syncNow: async () => {
    console.log("Sync context not initialized")
  },
  isInitialSyncComplete: false
}

// Create the context
const SyncContext = createContext<SyncContextType>(defaultContext)

// Custom hook to use the sync context
export const useSyncContext = () => useContext(SyncContext)

// Provider component
export function SyncProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession()
  const { data: activeOrganization } = authClient.useActiveOrganization()

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const [isInitialSyncComplete, setIsInitialSyncComplete] = useState(false)

  // Get the tRPC hooks for sync operations
  const syncNotesMutation = api.sync.syncNotes.useMutation()
  const syncBlocksMutation = api.sync.syncBlocks.useMutation()
  const syncDiscussionsMutation = api.sync.syncDiscussions.useMutation()
  const syncCommentsMutation = api.sync.syncComments.useMutation()

  // Sync notes for an organization
  const syncNotes = useCallback(
    async (organizationId: string) => {
      try {
        // Get notes from the client
        const clientNotes = await dexieDB.notes
          .where("organizationId")
          .equals(organizationId)
          .toArray()

        // Send to server and get updated data using tRPC mutation
        const serverNotes = await syncNotesMutation.mutateAsync({
          notes: clientNotes,
          organizationId
        })

        // Update client notes based on server response
        const notesToUpsert = serverNotes.map((note) => ({
          id: note.id,
          title: note.title,
          emoji: note.emoji || undefined,
          emojiSlug: note.emojiSlug || undefined,
          organizationId: note.organizationId,
          updatedAt: note.updatedAt,
          createdAt: note.createdAt,
          updatedByUserId: note.updatedByUserId,
          updatedByUserName: note.updatedByUserName,
          createdByUserId: note.createdByUserId,
          createdByUserName: note.createdByUserName,
          isPublic: note.isPublic,
          parentNoteId: note.parentNoteId
        }))

        // Identify notes to delete (in client but not in server)
        const serverNoteIds = new Set(serverNotes.map((note) => note.id))
        const clientNotesToDelete = clientNotes
          .filter((note) => !serverNoteIds.has(note.id))
          .map((note) => note.id)

        // Apply changes to client DB
        await dexieDB.transaction("rw", dexieDB.notes, async () => {
          if (clientNotesToDelete.length > 0) {
            await dexieDB.notes.bulkDelete(clientNotesToDelete)
          }
          if (notesToUpsert.length > 0) {
            await dexieDB.notes.bulkPut(notesToUpsert)
          }
        })

        return serverNotes
      } catch (error) {
        console.error("Error syncing notes:", error)
        throw error
      }
    },
    [syncNotesMutation]
  )

  // Sync blocks for a note
  const syncBlocks = useCallback(
    async (noteId: string) => {
      try {
        // Get blocks from the client
        const clientBlocks = await dexieDB.blocks
          .where("noteId")
          .equals(noteId)
          .toArray()

        // Send to server using tRPC mutation
        const serverBlocks = await syncBlocksMutation.mutateAsync({
          blocks: clientBlocks,
          noteId
        })

        // Update client blocks
        const blocksToPut = serverBlocks.map((block) => ({
          id: block.id,
          noteId: block.noteId,
          content: JSON.parse(block.content),
          order: block.order
        }))

        // Identify blocks to delete
        const serverBlockIds = new Set(serverBlocks.map((block) => block.id))
        const clientBlocksToDelete = clientBlocks
          .filter((block) => !serverBlockIds.has(block.id))
          .map((block) => block.id)

        // Apply changes to client DB
        await dexieDB.transaction("rw", dexieDB.blocks, async () => {
          if (clientBlocksToDelete.length > 0) {
            await dexieDB.blocks.bulkDelete(clientBlocksToDelete)
          }
          if (blocksToPut.length > 0) {
            await dexieDB.blocks.bulkPut(blocksToPut)
          }
        })

        return blocksToPut
      } catch (error) {
        console.error("Error syncing blocks:", error)
        throw error
      }
    },
    [syncBlocksMutation]
  )

  // Sync discussions for a note
  const syncDiscussions = useCallback(
    async (noteId: string) => {
      try {
        // Get discussions from the client
        const clientDiscussions = await dexieDB.discussions
          .where("noteId")
          .equals(noteId)
          .toArray()

        // Send to server using tRPC mutation
        const serverDiscussions = await syncDiscussionsMutation.mutateAsync({
          discussions: clientDiscussions,
          noteId
        })

        // Update client discussions
        const discussionsToPut = serverDiscussions.map((discussion) => ({
          id: discussion.id,
          noteId: discussion.noteId,
          blockId: discussion.blockId,
          documentContent: discussion.documentContent || undefined,
          createdAt: discussion.createdAt,
          isResolved: discussion.isResolved,
          userId: discussion.userId
        }))

        // Identify discussions to delete
        const serverDiscussionIds = new Set(
          serverDiscussions.map((discussion) => discussion.id)
        )
        const clientDiscussionsToDelete = clientDiscussions
          .filter((discussion) => !serverDiscussionIds.has(discussion.id))
          .map((discussion) => discussion.id)

        // Apply changes to client DB
        await dexieDB.transaction("rw", dexieDB.discussions, async () => {
          if (clientDiscussionsToDelete.length > 0) {
            await dexieDB.discussions.bulkDelete(clientDiscussionsToDelete)
          }
          if (discussionsToPut.length > 0) {
            await dexieDB.discussions.bulkPut(discussionsToPut)
          }
        })

        // For each discussion, sync its comments
        for (const discussion of discussionsToPut) {
          await syncComments(discussion.id)
        }

        return discussionsToPut
      } catch (error) {
        console.error("Error syncing discussions:", error)
        throw error
      }
    },
    [syncDiscussionsMutation]
  )

  // Sync comments for a discussion
  const syncComments = useCallback(
    async (discussionId: string) => {
      try {
        // Get comments from the client
        const clientComments = await dexieDB.comments
          .where("discussionId")
          .equals(discussionId)
          .toArray()

        // Send to server using tRPC mutation
        const serverComments = await syncCommentsMutation.mutateAsync({
          comments: clientComments,
          discussionId
        })

        // Update client comments
        const commentsToPut = serverComments.map((comment) => ({
          id: comment.id,
          discussionId: comment.discussionId,
          contentRich: JSON.parse(comment.contentRich),
          createdAt: comment.createdAt,
          isEdited: comment.isEdited,
          userId: comment.userId
        }))

        // Identify comments to delete
        const serverCommentIds = new Set(
          serverComments.map((comment) => comment.id)
        )
        const clientCommentsToDelete = clientComments
          .filter((comment) => !serverCommentIds.has(comment.id))
          .map((comment) => comment.id)

        // Apply changes to client DB
        await dexieDB.transaction("rw", dexieDB.comments, async () => {
          if (clientCommentsToDelete.length > 0) {
            await dexieDB.comments.bulkDelete(clientCommentsToDelete)
          }
          if (commentsToPut.length > 0) {
            await dexieDB.comments.bulkPut(commentsToPut)
          }
        })

        return commentsToPut
      } catch (error) {
        console.error("Error syncing comments:", error)
        throw error
      }
    },
    [syncCommentsMutation]
  )

  // Perform full sync
  const syncNow = useCallback(async () => {
    if (!session?.user || !activeOrganization?.id) {
      console.log("No active session or organization, skipping sync")
      return
    }

    setSyncStatus("syncing")

    try {
      // Sync notes for the active organization
      const orgId = activeOrganization.id
      const notes = await syncNotes(orgId)

      // For each note, sync blocks and discussions
      for (const note of notes) {
        await syncBlocks(note.id)
        await syncDiscussions(note.id)
      }

      // Update sync status
      setSyncStatus("success")
      const now = new Date()
      setLastSyncedAt(now)
      setIsInitialSyncComplete(true)
      localStorage.setItem("lastSyncedAt", now.toISOString())
    } catch (error) {
      console.error("Error during sync:", error)
      setSyncStatus("error")
    }
  }, [session, activeOrganization, syncNotes, syncBlocks, syncDiscussions])

  // Setup Dexie DB change listeners to trigger sync
  useEffect(() => {
    if (isInitialSyncComplete && activeOrganization?.id) {
      // Define a debounced sync function
      let syncTimeout: ReturnType<typeof setTimeout> | null = null

      const debouncedSync = () => {
        if (syncTimeout) {
          clearTimeout(syncTimeout)
        }

        // Wait 3 seconds after last change before syncing
        syncTimeout = setTimeout(() => {
          syncNow()
          syncTimeout = null
        }, 3000)
      }

      // Set up hooks for all tables
      dexieDB.notes.hook("creating", debouncedSync)
      dexieDB.notes.hook("updating", debouncedSync)
      dexieDB.notes.hook("deleting", debouncedSync)

      dexieDB.blocks.hook("creating", debouncedSync)
      dexieDB.blocks.hook("updating", debouncedSync)
      dexieDB.blocks.hook("deleting", debouncedSync)

      dexieDB.discussions.hook("creating", debouncedSync)
      dexieDB.discussions.hook("updating", debouncedSync)
      dexieDB.discussions.hook("deleting", debouncedSync)

      dexieDB.comments.hook("creating", debouncedSync)
      dexieDB.comments.hook("updating", debouncedSync)
      dexieDB.comments.hook("deleting", debouncedSync)

      // Clean up on unmount
      return () => {
        if (syncTimeout) {
          clearTimeout(syncTimeout)
        }
      }
    }
  }, [isInitialSyncComplete, activeOrganization, syncNow])

  // Check for initial data and start periodic sync
  useEffect(() => {
    const init = async () => {
      if (!isInitialSyncComplete && activeOrganization?.id) {
        // Initial data loading is handled by the useQuery hook
        // If we already have data in the local DB, mark sync as complete
        const orgId = activeOrganization.id
        const noteCount = await dexieDB.notes
          .where("organizationId")
          .equals(orgId)
          .count()

        if (noteCount > 0) {
          setIsInitialSyncComplete(true)
          const lastSyncStr = localStorage.getItem("lastSyncedAt")
          if (lastSyncStr) {
            setLastSyncedAt(new Date(lastSyncStr))
          }
        }
      }
    }

    init().catch(console.error)

    // Set up periodic sync (every 5 minutes)
    const intervalId = setInterval(
      () => {
        if (activeOrganization?.id && isInitialSyncComplete) {
          syncNow().catch(console.error)
        }
      },
      5 * 60 * 1000
    )

    return () => clearInterval(intervalId)
  }, [isInitialSyncComplete, activeOrganization, syncNow])

  // Context value
  const value: SyncContextType = {
    syncStatus,
    lastSyncedAt,
    syncNow,
    isInitialSyncComplete
  }

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}
