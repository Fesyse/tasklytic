import { apiVanilla } from "@/trpc/vanilla-client"
import { TRPCClientError } from "@trpc/client"
import { authClient } from "./auth-client"
import { dexieDB, type Note } from "./db-client"
import { deleteNotes } from "./db-queries"

// Types
export type SyncStatus = "idle" | "syncing" | "error" | "success"

export interface SyncResult {
  success: boolean
  error?: Error | TRPCClientError<any>
  notes?: Note[]
}

export interface BatchSyncResult {
  success: boolean
  error?: Error | TRPCClientError<any>
  data?: any[]
}

interface ServerNote extends Omit<Note, "favoritedByUserId"> {
  favoritedByUserId: string | null
}

/**
 * SyncService - A service for handling synchronization between local DB and server
 */
export class SyncService {
  // Singleton instance for app-wide access
  private static instance: SyncService | null = null

  // Sync status
  private _status: SyncStatus = "idle"
  private _lastSyncedAt: Date | null = null

  // tRPC utils (passed from the hook)
  private api: typeof apiVanilla = apiVanilla

  private constructor(api: typeof apiVanilla) {
    this.api = api

    // Initialize service
    const lastSyncStr =
      typeof window !== "undefined"
        ? localStorage.getItem("lastSyncedAt")
        : null
    if (lastSyncStr) {
      this._lastSyncedAt = new Date(lastSyncStr)
    }
  }

  /**
   * Get the singleton instance
   * @param utils tRPC utils obtained from a hook
   */
  public static getInstance(api: typeof apiVanilla): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService(api)
    } else {
      // Update utils in case they've changed
      SyncService.instance.api = api
    }
    return SyncService.instance
  }

  /**
   * Get current sync status
   */
  public get status(): SyncStatus {
    return this._status
  }

  /**
   * Get last successful sync time
   */
  public get lastSyncedAt(): Date | null {
    return this._lastSyncedAt
  }

  /**
   * Sync notes for a specific organization
   */
  public async syncNotes(organizationId: string): Promise<SyncResult> {
    try {
      console.log("[SYNC] Syncing notes for organization", organizationId)

      // Get notes from the client
      const clientNotes = await dexieDB.notes
        .where("organizationId")
        .equals(organizationId)
        .and((note) => !note.isDeleted)
        .toArray()

      // Send to server and get updated data
      // Since we're using utils instead of direct hooks, we need to use fetch
      const syncNotesResult = await this.api.sync.syncNotes.mutate({
        notes: clientNotes as any,
        organizationId
      })

      const serverNotes = syncNotesResult as unknown as ServerNote[]

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

      // Apply changes to client DB
      await dexieDB.transaction("rw", dexieDB.notes, async () => {
        await deleteNotes(organizationId)
        if (notesToUpsert.length > 0) {
          await dexieDB.notes.bulkPut(notesToUpsert)
        }
      })

      return { success: true, notes: notesToUpsert }
    } catch (error) {
      console.error("Error syncing notes:", error)
      return { success: false, error: error as Error }
    }
  }

  /**
   * Sync blocks for multiple notes in a single batch
   */
  public async syncBlocksBatch(noteIds: string[]): Promise<BatchSyncResult> {
    try {
      if (noteIds.length === 0) return { success: true, data: [] }
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
        const blocksToPut = []

        for (const noteId of noteIds) {
          const serverBlocksCheck = await this.api.sync.getBlocks.query({
            noteId
          })
          if (serverBlocksCheck && serverBlocksCheck.length > 0) {
            serverBlocksExist = true
            // Pull these blocks
            const blocks = serverBlocksCheck.map((block) => ({
              id: block.id,
              noteId: block.noteId,
              content: JSON.parse(block.content),
              order: block.order
            }))
            blocksToPut.push(...blocks)
          }
        }

        if (blocksToPut.length > 0) {
          await dexieDB.blocks.bulkPut(blocksToPut)
        }

        return { success: true, data: blocksToPut }
      }

      // Process one note at a time to avoid duplicate key violations
      const allServerBlocks = []

      // Process one note at a time
      for (const noteId of noteIds) {
        const noteBlocks = allClientBlocks.filter(
          (block) => block.noteId === noteId
        )
        if (noteBlocks.length === 0) continue

        try {
          // Send this note's blocks to server
          const serverBlocksForNote = await this.api.sync.syncBlocks.mutate({
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
        const serverBlockIds = new Set(allServerBlocks.map((block) => block.id))
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

        return { success: true, data: blocksToPut }
      }

      return { success: true, data: [] }
    } catch (error) {
      console.error("Error batch syncing blocks:", error)
      return { success: false, error: error as Error }
    }
  }

  /**
   * Sync discussions for multiple notes in a single batch
   */
  public async syncDiscussionsBatch(
    noteIds: string[]
  ): Promise<BatchSyncResult> {
    try {
      if (noteIds.length === 0) return { success: true, data: [] }
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
        return { success: true, data: [] }
      }

      // Process one note at a time to avoid duplicate key violations
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
            await this.api.sync.syncDiscussions.mutate({
              discussions: noteDiscussions,
              noteId
            })

          allServerDiscussions.push(...serverDiscussionsForNote)
        } catch (error) {
          console.error(`Error syncing discussions for note ${noteId}:`, error)
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
            await this.syncCommentsBatch(discussionIds)
          }
        }

        return { success: true, data: discussionsToPut }
      }

      return { success: true, data: [] }
    } catch (error) {
      console.error("Error batch syncing discussions:", error)
      return { success: false, error: error as Error }
    }
  }

  /**
   * Sync comments for multiple discussions in a single batch
   */
  public async syncCommentsBatch(
    discussionIds: string[]
  ): Promise<BatchSyncResult> {
    try {
      if (discussionIds.length === 0) return { success: true, data: [] }
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
        return { success: true, data: [] }
      }

      // Process one discussion at a time to avoid duplicate key violations
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
            await this.api.sync.syncComments.mutate({
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

        return { success: true, data: commentsToPut }
      }

      return { success: true, data: [] }
    } catch (error) {
      console.error("Error batch syncing comments:", error)
      return { success: false, error: error as Error }
    }
  }

  /**
   * Perform a full sync operation
   */
  public async syncAll(noteId: string): Promise<SyncResult> {
    if (this._status === "syncing") {
      console.log("Sync already in progress, skipping duplicate request")
      return { success: false, error: new Error("Sync already in progress") }
    }

    // Throttle sync calls - don't allow more than one sync operation every 3 seconds
    const now = Date.now()
    if (this._lastSyncedAt && now - this._lastSyncedAt.getTime() < 3000) {
      console.log("Throttling sync request - too soon after previous sync")
      return {
        success: false,
        error: new Error("Sync throttled - too frequent")
      }
    }

    this._status = "syncing"

    try {
      // Get active organization
      const { data: activeOrganization } =
        await authClient.organization.getFullOrganization()

      if (!activeOrganization?.id) {
        throw new Error("No active organization to sync")
      }

      // First sync the organization's notes
      console.log("[SYNC] Starting sync process")
      const notesResult = await this.syncNotes(activeOrganization.id)

      if (!notesResult.success) {
        throw notesResult.error || new Error("Failed to sync notes")
      }

      // Get all note IDs to sync
      const syncedNotes = notesResult.notes || []
      const noteIds = [noteId]

      if (noteIds.length > 0) {
        // Process notes in larger batches for true batched syncing
        const BATCH_SIZE = 20

        // Process in chunks to keep request sizes reasonable
        for (let i = 0; i < noteIds.length; i += BATCH_SIZE) {
          const batchIds = noteIds.slice(i, i + BATCH_SIZE)
          console.log(
            `[SYNC] Processing batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batchIds.length} notes`
          )

          // Sync blocks and discussions for this batch
          await this.syncBlocksBatch(batchIds)
          await this.syncDiscussionsBatch(batchIds)
        }
      }

      this._lastSyncedAt = new Date()
      if (typeof window !== "undefined") {
        localStorage.setItem("lastSyncedAt", this._lastSyncedAt.toISOString())
      }
      this._status = "success"
      console.log("[SYNC] Sync completed successfully")

      return { success: true, notes: syncedNotes }
    } catch (error) {
      this._status = "error"
      console.error("Error syncing data:", error)
      return { success: false, error: error as Error }
    } finally {
      setTimeout(() => {
        this._status = "idle"
      }, 0)
    }
  }

  /**
   * Pull data for a specific note from the server
   */
  public async pullNoteFromServer(
    noteId: string,
    organizationId: string
  ): Promise<SyncResult> {
    try {
      // Try to get note data directly from server
      const serverNote = await this.api.sync.getNotes
        .query({
          organizationId: organizationId
        })
        .then((notes) => notes.find((note) => note.id === noteId))

      if (!serverNote) {
        return {
          success: false,
          error: new Error(`Note not found on server: ${noteId}`)
        }
      }

      // Store in local DB
      await dexieDB.notes.put({
        id: serverNote.id,
        title: serverNote.title,
        emoji: serverNote.emoji ?? undefined,
        emojiSlug: serverNote.emojiSlug ?? undefined,
        organizationId: serverNote.organizationId,
        updatedAt: serverNote.updatedAt,
        createdAt: serverNote.createdAt,
        updatedByUserId: serverNote.updatedByUserId,
        updatedByUserName: serverNote.updatedByUserName,
        createdByUserId: serverNote.createdByUserId,
        createdByUserName: serverNote.createdByUserName,
        isPublic: serverNote.isPublic,
        parentNoteId: serverNote.parentNoteId,
        isFavorited: serverNote.isFavorited,
        favoritedByUserId: serverNote.favoritedByUserId
      })

      // Get blocks for this note
      const blockData = await this.api.sync.getBlocks.query({
        noteId: serverNote.id
      })

      if (blockData && blockData.length > 0) {
        // Store blocks in local DB
        await dexieDB.transaction("rw", dexieDB.blocks, async () => {
          const blocksToAdd = blockData.map((block: any) => ({
            id: block.id,
            noteId: block.noteId,
            content: JSON.parse(block.content),
            order: block.order
          }))
          await dexieDB.blocks.bulkPut(blocksToAdd)
        })
      }

      // Sync discussions and comments for this note
      await this.syncDiscussionsBatch([noteId])

      return {
        success: true,
        notes: [serverNote as unknown as Note]
      }
    } catch (error) {
      console.error("Error fetching note from server:", error)
      return { success: false, error: error as Error }
    }
  }
}

// Export a function to create an instance with utils
// Do NOT export a singleton instance directly
export function createSyncService(api: typeof apiVanilla) {
  return SyncService.getInstance(api)
}
