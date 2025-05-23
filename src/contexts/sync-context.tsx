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
import { dexieDB, type Note } from "@/lib/db-client"
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
        if (typeof window !== "undefined") {
          localStorage.setItem("lastSyncedAt", now.toISOString())
        }
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

  // Fix the type error by being more explicit about the favoritedByUserId type
  interface ServerNote extends Omit<Note, "favoritedByUserId"> {
    favoritedByUserId: string | null
  }

  // Sync notes for an organization
  const syncNotes = useCallback(
    async (organizationId: string) => {
      console.log("[SYNC] Syncing notes for organization", organizationId)

      try {
        // Get notes from the client
        const clientNotes = await dexieDB.notes
          .where("organizationId")
          .equals(organizationId)
          .toArray()

        // Send to server and get updated data using tRPC mutation
        const serverNotes = (await syncNotesMutation.mutateAsync({
          notes: clientNotes as any, // Type assertion to bypass the type check
          organizationId
        })) as ServerNote[]

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
          parentNoteId: note.parentNoteId,
          isFavorited: note.isFavorited === true,
          favoritedByUserId: note.favoritedByUserId
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

  // Sync blocks for multiple notes in a single batch
  const syncBlocksBatch = useCallback(
    async (noteIds: string[]) => {
      try {
        if (noteIds.length === 0) return []
        console.log(`[SYNC] Batch syncing blocks for ${noteIds.length} notes`)

        // Collect all blocks for all provided notes
        const allClientBlocks = []
        for (const noteId of noteIds) {
          const noteBlocks = await dexieDB.blocks
            .where("noteId")
            .equals(noteId)
            .toArray()
          allClientBlocks.push(...noteBlocks)
        }

        // Skip if no blocks
        if (allClientBlocks.length === 0) {
          // Check if any server blocks exist
          let serverBlocksExist = false
          for (const noteId of noteIds) {
            const serverBlocksCheck = await utils.sync.getBlocks.fetch({
              noteId
            })
            if (serverBlocksCheck && serverBlocksCheck.length > 0) {
              serverBlocksExist = true
              // Pull these blocks
              const blocksToPut = serverBlocksCheck.map((block) => ({
                id: block.id,
                noteId: block.noteId,
                content: JSON.parse(block.content),
                order: block.order
              }))
              await dexieDB.blocks.bulkPut(blocksToPut)
            }
          }
          return []
        }

        // To avoid duplicate key violations, we'll sync blocks per note instead of all at once
        // This is less efficient but more reliable
        const allServerBlocks = []

        // Process one note at a time
        for (const noteId of noteIds) {
          const noteBlocks = allClientBlocks.filter(
            (block) => block.noteId === noteId
          )
          if (noteBlocks.length === 0) continue

          try {
            // Send this note's blocks to server
            const serverBlocksForNote = await syncBlocksMutation.mutateAsync({
              blocks: noteBlocks,
              noteId
            })

            allServerBlocks.push(...serverBlocksForNote)
          } catch (error) {
            console.error(`Error syncing blocks for note ${noteId}:`, error)
            // Continue with other notes instead of failing the entire batch
          }
        }

        // If we have server blocks from any of the notes
        if (allServerBlocks.length > 0) {
          // Update client blocks
          const blocksToPut = allServerBlocks.map((block) => ({
            id: block.id,
            noteId: block.noteId,
            content: JSON.parse(block.content),
            order: block.order
          }))

          // Identify blocks to delete (in client but not in server)
          const serverBlockIds = new Set(
            allServerBlocks.map((block) => block.id)
          )
          const clientBlocksToDelete = allClientBlocks
            .filter((block) => !serverBlockIds.has(block.id))
            .map((block) => block.id)

          // Apply changes to client DB in one transaction
          await dexieDB.transaction("rw", dexieDB.blocks, async () => {
            if (clientBlocksToDelete.length > 0) {
              await dexieDB.blocks.bulkDelete(clientBlocksToDelete)
            }
            if (blocksToPut.length > 0) {
              await dexieDB.blocks.bulkPut(blocksToPut)
            }
          })

          return blocksToPut
        }

        return []
      } catch (error) {
        console.error("Error batch syncing blocks:", error)
        throw error
      }
    },
    [syncBlocksMutation, utils]
  )

  // Sync discussions for multiple notes in a single batch
  const syncDiscussionsBatch = useCallback(
    async (noteIds: string[]) => {
      try {
        if (noteIds.length === 0) return []
        console.log(
          `[SYNC] Batch syncing discussions for ${noteIds.length} notes`
        )

        // Collect all discussions for all provided notes
        const allClientDiscussions = []
        for (const noteId of noteIds) {
          const noteDiscussions = await dexieDB.discussions
            .where("noteId")
            .equals(noteId)
            .toArray()
          allClientDiscussions.push(...noteDiscussions)
        }

        // Skip if no discussions
        if (allClientDiscussions.length === 0) {
          return []
        }

        // To avoid duplicate key violations, we'll sync discussions per note instead of all at once
        const allServerDiscussions = []

        // Process one note at a time
        for (const noteId of noteIds) {
          const noteDiscussions = allClientDiscussions.filter(
            (discussion) => discussion.noteId === noteId
          )
          if (noteDiscussions.length === 0) continue

          try {
            // Send this note's discussions to server
            const serverDiscussionsForNote =
              await syncDiscussionsMutation.mutateAsync({
                discussions: noteDiscussions,
                noteId
              })

            allServerDiscussions.push(...serverDiscussionsForNote)
          } catch (error) {
            console.error(
              `Error syncing discussions for note ${noteId}:`,
              error
            )
            // Continue with other notes instead of failing the entire batch
          }
        }

        // If we have server discussions from any of the notes
        if (allServerDiscussions.length > 0) {
          // Update client discussions
          const discussionsToPut = allServerDiscussions.map((discussion) => ({
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
            allServerDiscussions.map((discussion) => discussion.id)
          )
          const clientDiscussionsToDelete = allClientDiscussions
            .filter((discussion) => !serverDiscussionIds.has(discussion.id))
            .map((discussion) => discussion.id)

          // Apply changes to client DB in one transaction
          await dexieDB.transaction("rw", dexieDB.discussions, async () => {
            if (clientDiscussionsToDelete.length > 0) {
              await dexieDB.discussions.bulkDelete(clientDiscussionsToDelete)
            }
            if (discussionsToPut.length > 0) {
              await dexieDB.discussions.bulkPut(discussionsToPut)
            }
          })

          // Batch sync all comments for these discussions
          if (discussionsToPut.length > 0) {
            const discussionIds = discussionsToPut.map((d) => d.id)
            if (discussionIds.length > 0) {
              await syncCommentsBatch(discussionIds)
            }
          }

          return discussionsToPut
        }

        return []
      } catch (error) {
        console.error("Error batch syncing discussions:", error)
        throw error
      }
    },
    [syncDiscussionsMutation]
  )

  // Sync comments for multiple discussions in a single batch
  const syncCommentsBatch = useCallback(
    async (discussionIds: string[]) => {
      try {
        if (discussionIds.length === 0) return []

        console.log(
          `[SYNC] Batch syncing comments for ${discussionIds.length} discussions`
        )

        // Collect all comments for all provided discussions
        const allClientComments = []
        for (const discussionId of discussionIds) {
          const discussionComments = await dexieDB.comments
            .where("discussionId")
            .equals(discussionId)
            .toArray()
          allClientComments.push(...discussionComments)
        }

        // Skip if no comments
        if (allClientComments.length === 0) {
          return []
        }

        // To avoid duplicate key violations, we'll sync comments per discussion instead of all at once
        const allServerComments = []

        // Process one discussion at a time
        for (const discussionId of discussionIds) {
          const discussionComments = allClientComments.filter(
            (comment) => comment.discussionId === discussionId
          )
          if (discussionComments.length === 0) continue

          try {
            // Send this discussion's comments to server
            const serverCommentsForDiscussion =
              await syncCommentsMutation.mutateAsync({
                comments: discussionComments,
                discussionId
              })

            allServerComments.push(...serverCommentsForDiscussion)
          } catch (error) {
            console.error(
              `Error syncing comments for discussion ${discussionId}:`,
              error
            )
            // Continue with other discussions instead of failing the entire batch
          }
        }

        // If we have server comments from any of the discussions
        if (allServerComments.length > 0) {
          // Update client comments
          const commentsToPut = allServerComments.map((comment) => ({
            id: comment.id,
            discussionId: comment.discussionId,
            contentRich: JSON.parse(comment.contentRich),
            createdAt: comment.createdAt,
            isEdited: comment.isEdited,
            userId: comment.userId
          }))

          // Identify comments to delete
          const serverCommentIds = new Set(
            allServerComments.map((comment) => comment.id)
          )
          const clientCommentsToDelete = allClientComments
            .filter((comment) => !serverCommentIds.has(comment.id))
            .map((comment) => comment.id)

          // Apply changes to client DB in one transaction
          await dexieDB.transaction("rw", dexieDB.comments, async () => {
            if (clientCommentsToDelete.length > 0) {
              await dexieDB.comments.bulkDelete(clientCommentsToDelete)
            }
            if (commentsToPut.length > 0) {
              await dexieDB.comments.bulkPut(commentsToPut)
            }
          })

          return commentsToPut
        }

        return []
      } catch (error) {
        console.error("Error batch syncing comments:", error)
        throw error
      }
    },
    [syncCommentsMutation]
  )

  // Define sync function (with added throttling)
  const syncNow = useCallback(async () => {
    // Prevent overlapping sync operations
    if (syncStatus === "syncing") {
      console.log("Sync already in progress, skipping duplicate request")
      return
    }

    // Throttle sync calls - don't allow more than one sync operation every 3 seconds
    const now = Date.now()
    if (lastSyncedAt && now - lastSyncedAt.getTime() < 3000) {
      console.log("Throttling sync request - too soon after previous sync")
      return
    }

    setSyncStatus("syncing")
    // Set a flag to indicate we're running a sync operation triggered by the app
    // This helps prevent infinite sync loops
    setIsInternalSyncActive(true)

    try {
      if (activeOrganization?.id) {
        // First sync the organization's notes
        try {
          console.log("[SYNC] Starting sync process")
          const syncedNotes = await syncNotes(activeOrganization.id)

          // Get all note IDs to sync
          const noteIds = syncedNotes.map((note) => note.id)

          if (noteIds.length > 0) {
            // Process notes in larger batches for true batched syncing
            // A batch size of 10-20 is reasonable for batched operations
            const BATCH_SIZE = 20

            // Process in chunks to keep request sizes reasonable
            for (let i = 0; i < noteIds.length; i += BATCH_SIZE) {
              const batchIds = noteIds.slice(i, i + BATCH_SIZE)
              console.log(
                `[SYNC] Processing batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batchIds.length} notes`
              )

              // Sync blocks and discussions for this batch
              await syncBlocksBatch(batchIds)
              await syncDiscussionsBatch(batchIds)
            }
          }

          setLastSyncedAt(new Date())
          setSyncStatus("success")
          console.log("[SYNC] Sync completed successfully")
        } catch (error) {
          setSyncStatus("error")
          console.error("Error syncing data:", error)
        }
      }
    } finally {
      // Reset the flag when we're done
      setIsInternalSyncActive(false)
    }
  }, [
    syncStatus,
    lastSyncedAt,
    activeOrganization?.id,
    syncNotes,
    syncBlocksBatch,
    syncDiscussionsBatch
  ])

  // Setup Dexie DB change listeners to trigger sync
  useEffect(() => {
    if (
      isInitialSyncComplete &&
      activeOrganization?.id &&
      !isInternalSyncActive
    ) {
      // Create a single debounced sync function with a longer delay (60 seconds)
      // This will ensure we only sync once even if multiple DB changes happen
      let syncTimeout: ReturnType<typeof setTimeout> | null = null
      let pendingChanges = false

      const debouncedSync = () => {
        // Skip triggering sync if we're already in a sync operation
        if (isInternalSyncActive) {
          return
        }

        // Mark that we have pending changes
        pendingChanges = true

        // Clear existing timeout if any
        if (syncTimeout) {
          clearTimeout(syncTimeout)
        }

        // Set new timeout - wait 60 seconds after last change before syncing
        syncTimeout = setTimeout(() => {
          if (pendingChanges) {
            console.log("Running sync after debounce period")
            syncNow()
            pendingChanges = false
          }
          syncTimeout = null
        }, 60 * 1000) // 60 second delay
      }

      // Create one handler for all tables to avoid multiple sync triggers
      const handleDatabaseChange = () => {
        debouncedSync()
      }

      // Set up hooks for all tables with a single handler
      dexieDB.notes.hook("creating", handleDatabaseChange)
      dexieDB.notes.hook("updating", handleDatabaseChange)
      dexieDB.notes.hook("deleting", handleDatabaseChange)

      dexieDB.blocks.hook("creating", handleDatabaseChange)
      dexieDB.blocks.hook("updating", handleDatabaseChange)
      dexieDB.blocks.hook("deleting", handleDatabaseChange)

      dexieDB.discussions.hook("creating", handleDatabaseChange)
      dexieDB.discussions.hook("updating", handleDatabaseChange)
      dexieDB.discussions.hook("deleting", handleDatabaseChange)

      dexieDB.comments.hook("creating", handleDatabaseChange)
      dexieDB.comments.hook("updating", handleDatabaseChange)
      dexieDB.comments.hook("deleting", handleDatabaseChange)

      // Clean up on unmount
      return () => {
        if (syncTimeout) {
          clearTimeout(syncTimeout)
        }

        // Unsubscribe from all hooks
        dexieDB.notes.hook("creating").unsubscribe(handleDatabaseChange)
        dexieDB.notes.hook("updating").unsubscribe(handleDatabaseChange)
        dexieDB.notes.hook("deleting").unsubscribe(handleDatabaseChange)

        dexieDB.blocks.hook("creating").unsubscribe(handleDatabaseChange)
        dexieDB.blocks.hook("updating").unsubscribe(handleDatabaseChange)
        dexieDB.blocks.hook("deleting").unsubscribe(handleDatabaseChange)

        dexieDB.discussions.hook("creating").unsubscribe(handleDatabaseChange)
        dexieDB.discussions.hook("updating").unsubscribe(handleDatabaseChange)
        dexieDB.discussions.hook("deleting").unsubscribe(handleDatabaseChange)

        dexieDB.comments.hook("creating").unsubscribe(handleDatabaseChange)
        dexieDB.comments.hook("updating").unsubscribe(handleDatabaseChange)
        dexieDB.comments.hook("deleting").unsubscribe(handleDatabaseChange)
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
