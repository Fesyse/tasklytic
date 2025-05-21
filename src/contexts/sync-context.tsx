"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  // Flag to track if changes are from sync operation
  const [isInternalSyncActive, setIsInternalSyncActive] = useState(false)
  // Ref to track if sync is currently running (mutex)
  const syncInProgressRef = useRef(false)

  // Get the tRPC hooks for sync operations
  const syncNotesMutation = api.sync.syncNotes.useMutation()
  const syncBlocksMutation = api.sync.syncBlocks.useMutation()
  const syncDiscussionsMutation = api.sync.syncDiscussions.useMutation()
  const syncCommentsMutation = api.sync.syncComments.useMutation()
  const utils = api.useUtils()

  // Function to handle initial notes data from server
  const handleInitialNotes = useCallback(
    async (serverNotes: any[]) => {
      try {
        // Add notes to client DB
        await dexieDB.transaction("rw", dexieDB.notes, async () => {
          const notesToAdd = serverNotes.map((note) => ({
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
          await dexieDB.notes.bulkAdd(notesToAdd)
        })

        // For each note, load blocks and discussions
        for (const note of serverNotes) {
          // Load blocks
          const blockData = await utils.sync.getBlocks.fetch({
            noteId: note.id
          })
          if (blockData && blockData.length > 0) {
            await dexieDB.transaction("rw", dexieDB.blocks, async () => {
              const blocksToAdd = blockData.map((block: any) => ({
                id: block.id,
                noteId: block.noteId,
                content: JSON.parse(block.content),
                order: block.order
              }))
              await dexieDB.blocks.bulkAdd(blocksToAdd)
            })
          }

          // Load discussions and comments
          const discussionData = await utils.sync.getDiscussions.fetch({
            noteId: note.id
          })
          if (discussionData && discussionData.length > 0) {
            await dexieDB.transaction("rw", dexieDB.discussions, async () => {
              const discussionsToAdd = discussionData.map(
                (discussion: any) => ({
                  id: discussion.id,
                  noteId: discussion.noteId,
                  blockId: discussion.blockId,
                  documentContent: discussion.documentContent || undefined,
                  createdAt: discussion.createdAt,
                  isResolved: discussion.isResolved,
                  userId: discussion.userId
                })
              )
              await dexieDB.discussions.bulkAdd(discussionsToAdd)
            })

            // Load comments for each discussion
            for (const discussion of discussionData) {
              const commentData = await utils.sync.getComments.fetch({
                discussionId: discussion.id
              })
              if (commentData && commentData.length > 0) {
                await dexieDB.transaction("rw", dexieDB.comments, async () => {
                  const commentsToAdd = commentData.map((comment: any) => ({
                    id: comment.id,
                    discussionId: comment.discussionId,
                    contentRich: JSON.parse(comment.contentRich),
                    createdAt: comment.createdAt,
                    isEdited: comment.isEdited,
                    userId: comment.userId
                  }))
                  await dexieDB.comments.bulkAdd(commentsToAdd)
                })
              }
            }
          }
        }

        const now = new Date()
        setLastSyncedAt(now)
        setIsInitialSyncComplete(true)
        localStorage.setItem("lastSyncedAt", now.toISOString())
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    },
    [utils]
  )

  // Check for initial data when organization changes
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isInitialSyncComplete && activeOrganization?.id) {
        try {
          // Check if we already have data
          const orgId = activeOrganization.id
          const noteCount = await dexieDB.notes
            .where("organizationId")
            .equals(orgId)
            .count()

          if (noteCount === 0) {
            // Fetch data directly
            const data = await utils.sync.getNotes.fetch({
              organizationId: orgId
            })
            if (data && data.length > 0) {
              await handleInitialNotes(data)
            }
          } else {
            // We already have data
            setIsInitialSyncComplete(true)
            const lastSyncStr = localStorage.getItem("lastSyncedAt")
            if (lastSyncStr) {
              setLastSyncedAt(new Date(lastSyncStr))
            }
          }
        } catch (error) {
          console.error("Error loading initial data:", error)
        }
      }
    }

    loadInitialData().catch(console.error)
  }, [activeOrganization?.id, isInitialSyncComplete, handleInitialNotes, utils])

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
    async (noteId: string, clientBlocksParam?: any[]) => {
      try {
        // Use provided blocks if available, otherwise fetch from DB
        const clientBlocks =
          clientBlocksParam ||
          (await dexieDB.blocks.where("noteId").equals(noteId).toArray())

        // Skip empty syncs to reduce network requests
        if (clientBlocks.length === 0) {
          // Just check if there are any blocks on the server that we need
          const serverBlocksCheck = await utils.sync.getBlocks.fetch({ noteId })
          if (serverBlocksCheck && serverBlocksCheck.length > 0) {
            // We need to pull blocks from server
            const blocksToPut = serverBlocksCheck.map((block) => ({
              id: block.id,
              noteId: block.noteId,
              content: JSON.parse(block.content),
              order: block.order
            }))

            await dexieDB.blocks.bulkPut(blocksToPut)
          }
          return []
        }

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
    [syncBlocksMutation, utils]
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

    // Mutex to prevent concurrent syncs
    if (syncInProgressRef.current) {
      console.log("Sync already in progress, skipping duplicate sync")
      return
    }

    syncInProgressRef.current = true
    setSyncStatus("syncing")
    // Set the internal sync flag to prevent hooks from triggering
    setIsInternalSyncActive(true)

    try {
      // Sync notes for the active organization
      const orgId = activeOrganization.id
      const notes = await syncNotes(orgId)

      // Instead of syncing each note's blocks and discussions immediately,
      // collect all the IDs and do fewer, larger operations
      if (notes.length > 0) {
        // Sync all blocks in one batch if possible
        const noteIds = notes.map((note) => note.id)

        // Only do blocks sync if we have notes to sync
        if (noteIds.length > 0) {
          // For each note, get client blocks
          const allClientBlocks = []
          for (const noteId of noteIds) {
            const clientBlocks = await dexieDB.blocks
              .where("noteId")
              .equals(noteId)
              .toArray()

            allClientBlocks.push(...clientBlocks)
          }

          // Group client blocks by noteId for better handling
          const blocksByNoteId: { [noteId: string]: any[] } = {}
          for (const block of allClientBlocks) {
            const noteId = block.noteId
            if (noteId) {
              if (!blocksByNoteId[noteId]) {
                blocksByNoteId[noteId] = []
              }
              blocksByNoteId[noteId].push(block)
            }
          }

          // Sync blocks for each note, but limit concurrency
          const BATCH_SIZE = 3 // Process notes in small batches to avoid too many concurrent requests

          for (let i = 0; i < noteIds.length; i += BATCH_SIZE) {
            const batch = noteIds.slice(i, i + BATCH_SIZE)
            const batchPromises = batch.map((noteId) => {
              const blocksForNote =
                noteId && blocksByNoteId[noteId] ? blocksByNoteId[noteId] : []
              return syncBlocks(noteId, blocksForNote)
            })

            // Wait for this batch to complete before starting the next one
            await Promise.all(batchPromises)
          }

          // Now sync discussions with the same batching approach
          for (let i = 0; i < noteIds.length; i += BATCH_SIZE) {
            const batch = noteIds.slice(i, i + BATCH_SIZE)
            const batchPromises = batch.map((noteId) => syncDiscussions(noteId))

            // Wait for this batch to complete before starting the next one
            await Promise.all(batchPromises)
          }
        }
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
    } finally {
      // Always reset the flags when done
      setIsInternalSyncActive(false)
      syncInProgressRef.current = false
    }
  }, [session, activeOrganization, syncNotes, syncBlocks, syncDiscussions])

  // Setup Dexie DB change listeners to trigger sync
  useEffect(() => {
    if (isInitialSyncComplete && activeOrganization?.id) {
      // Define a debounced sync function
      let syncTimeout: ReturnType<typeof setTimeout> | null = null

      const debouncedSync = () => {
        // Skip triggering sync if we're already in a sync operation
        if (isInternalSyncActive) {
          console.log("Skipping sync hook because internal sync is active")
          return
        }

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
  }, [isInitialSyncComplete, activeOrganization, syncNow, isInternalSyncActive])

  // Set up periodic sync
  useEffect(() => {
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
