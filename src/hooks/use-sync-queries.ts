import { useSyncContext } from "@/contexts/sync-context"
import { authClient } from "@/lib/auth-client"
import { dexieDB, type Note } from "@/lib/db-client"
import { createId } from "@/server/db/schema"
import { api } from "@/trpc/react"
import { useCallback } from "react"
import { useSyncedNote, useSyncedNotes } from "./use-sync"

/**
 * Hook for working with a single note using the sync layer with tRPC and React Query
 */
export function useSyncedNoteQueries(noteId: string) {
  const { syncNow } = useSyncContext()
  const { note, blocks, isLoading, error, syncStatus } = useSyncedNote(noteId)
  const utils = api.useUtils()

  // Update the note's title
  const updateNoteTitle = useCallback(
    async (title: string) => {
      if (!note) return { data: null, error: new Error("Note not found") }

      try {
        // Create updated note object
        const updatedNote: Note = {
          ...note,
          title,
          updatedAt: new Date()
        }

        // Apply the change locally
        await dexieDB.notes.update(noteId, updatedNote)

        // Trigger immediate sync and invalidate queries
        await syncNow()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating note title:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [note, noteId, syncNow, utils]
  )

  // Update note's emoji
  const updateNoteEmoji = useCallback(
    async (emoji: string, emojiSlug: string) => {
      if (!note) return { data: null, error: new Error("Note not found") }

      try {
        // Create updated note object
        const updatedNote: Note = {
          ...note,
          emoji,
          emojiSlug,
          updatedAt: new Date()
        }

        // Apply the change locally
        await dexieDB.notes.update(noteId, updatedNote)

        // Trigger immediate sync and invalidate queries
        await syncNow()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating note emoji:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [note, noteId, syncNow, utils]
  )

  // Create a block in the note
  const createBlock = useCallback(
    async (content: any, order: number) => {
      if (!note) return { data: null, error: new Error("Note not found") }

      try {
        const blockId = createId()
        await dexieDB.blocks.add({
          id: blockId,
          noteId,
          content,
          order
        })

        // Trigger immediate sync and invalidate queries
        await syncNow()

        return { data: blockId, error: null }
      } catch (err) {
        console.error("Error creating block:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [note, noteId, syncNow, utils]
  )

  // Update a block in the note
  const updateBlock = useCallback(
    async (blockId: string, content: any) => {
      try {
        await dexieDB.blocks.update(blockId, {
          content
        })

        // Trigger immediate sync and invalidate queries
        await syncNow()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating block:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [noteId, syncNow, utils]
  )

  // Delete a block from the note
  const deleteBlock = useCallback(
    async (blockId: string) => {
      try {
        await dexieDB.blocks.delete(blockId)

        // Trigger immediate sync and invalidate queries
        await syncNow()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error deleting block:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [noteId, syncNow, utils]
  )

  return {
    note,
    blocks,
    isLoading,
    error,
    syncStatus,
    updateNoteTitle,
    updateNoteEmoji,
    createBlock,
    updateBlock,
    deleteBlock
  }
}

/**
 * Hook for working with organization notes using the sync layer with tRPC and React Query
 */
export function useSyncedOrganizationNotes(organizationId: string) {
  const { syncNow } = useSyncContext()
  const { notes, isLoading, error, syncStatus } = useSyncedNotes(organizationId)
  const { data: session } = authClient.useSession()
  const utils = api.useUtils()

  // Create a new note
  const createNote = useCallback(
    async (parentNoteId?: string) => {
      if (!session?.user) {
        return {
          data: null,
          error: new Error("User not authenticated")
        }
      }

      try {
        const noteId = createId()
        await dexieDB.notes.add({
          id: noteId,
          title: "",
          emoji: undefined,
          emojiSlug: undefined,
          isPublic: false,
          updatedAt: new Date(),
          updatedByUserId: session.user.id,
          updatedByUserName: session.user.name,
          createdByUserId: session.user.id,
          createdByUserName: session.user.name,
          createdAt: new Date(),
          organizationId,
          parentNoteId: parentNoteId ?? null
        })

        // Trigger immediate sync and invalidate queries
        await syncNow()
        utils.sync.getNotes.invalidate({ organizationId })

        return { data: noteId, error: null }
      } catch (err) {
        console.error("Error creating note:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [session, organizationId, syncNow, utils]
  )

  // Delete a note
  const deleteNote = useCallback(
    async (id: string) => {
      try {
        await dexieDB.notes.delete(id)

        // Also delete child notes
        const childNotes = await dexieDB.notes
          .where("parentNoteId")
          .equals(id)
          .toArray()

        for (const childNote of childNotes) {
          await dexieDB.notes.delete(childNote.id)
        }

        // Trigger immediate sync and invalidate queries
        await syncNow()
        utils.sync.getNotes.invalidate({ organizationId })

        return { data: true, error: null }
      } catch (err) {
        console.error("Error deleting note:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [organizationId, syncNow, utils]
  )

  return {
    notes,
    isLoading,
    error,
    syncStatus,
    createNote,
    deleteNote
  }
}

/**
 * Hook for working with discussions on a note with tRPC and React Query
 */
export function useSyncedDiscussions(noteId: string) {
  const { syncNow } = useSyncContext()
  const { note, blocks } = useSyncedNote(noteId)
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id || ""
  const utils = api.useUtils()

  // Get discussions for a note
  const getDiscussions = useCallback(async () => {
    try {
      const discussions = await dexieDB.discussions
        .where("noteId")
        .equals(noteId)
        .toArray()

      // Get comments for each discussion
      const discussionsWithComments = await Promise.all(
        discussions.map(async (discussion) => {
          const comments = await dexieDB.comments
            .where("discussionId")
            .equals(discussion.id)
            .toArray()

          return {
            ...discussion,
            comments
          }
        })
      )

      return { data: discussionsWithComments, error: null }
    } catch (err) {
      console.error("Error getting discussions:", err)
      return {
        data: null,
        error: err instanceof Error ? err : new Error(String(err))
      }
    }
  }, [noteId])

  // Create a new discussion
  const createDiscussion = useCallback(
    async (blockId: string, documentContent: string, contentRich: any) => {
      if (!userId) {
        return {
          data: null,
          error: new Error("User not authenticated")
        }
      }

      try {
        // Create discussion
        const discussionId = createId()
        await dexieDB.discussions.add({
          id: discussionId,
          noteId,
          blockId,
          documentContent,
          createdAt: new Date(),
          isResolved: false,
          userId
        })

        // Create initial comment
        const commentId = createId()
        await dexieDB.comments.add({
          id: commentId,
          discussionId,
          contentRich,
          createdAt: new Date(),
          isEdited: false,
          userId
        })

        // Trigger immediate sync and invalidate queries
        await syncNow()
        utils.sync.getDiscussions.invalidate({ noteId })

        return { data: discussionId, error: null }
      } catch (err) {
        console.error("Error creating discussion:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [noteId, userId, syncNow, utils]
  )

  // Update discussion resolved status
  const updateDiscussionResolved = useCallback(
    async (id: string, isResolved: boolean) => {
      try {
        await dexieDB.discussions.update(id, { isResolved })

        // Trigger immediate sync and invalidate queries
        await syncNow()
        utils.sync.getDiscussions.invalidate({ noteId })

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating discussion:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [noteId, syncNow, utils]
  )

  // Delete a discussion
  const deleteDiscussion = useCallback(
    async (id: string) => {
      try {
        await dexieDB.discussions.delete(id)

        // Trigger immediate sync and invalidate queries
        await syncNow()
        utils.sync.getDiscussions.invalidate({ noteId })

        return { data: true, error: null }
      } catch (err) {
        console.error("Error deleting discussion:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [noteId, syncNow, utils]
  )

  // Add a comment to a discussion
  const createComment = useCallback(
    async (discussionId: string, contentRich: any) => {
      if (!userId) {
        return {
          data: null,
          error: new Error("User not authenticated")
        }
      }

      try {
        const commentId = createId()
        await dexieDB.comments.add({
          id: commentId,
          discussionId,
          contentRich,
          createdAt: new Date(),
          isEdited: false,
          userId
        })

        // Trigger immediate sync and invalidate queries
        await syncNow()
        utils.sync.getComments.invalidate({ discussionId })

        return { data: commentId, error: null }
      } catch (err) {
        console.error("Error creating comment:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [userId, syncNow, utils]
  )

  // Update a comment
  const updateComment = useCallback(
    async (id: string, contentRich: any) => {
      try {
        // Get the discussion ID for the comment
        const comment = await dexieDB.comments.get(id)
        if (!comment) {
          return {
            data: null,
            error: new Error("Comment not found")
          }
        }

        const discussionId = comment.discussionId

        await dexieDB.comments.update(id, {
          contentRich,
          isEdited: true
        })

        // Trigger immediate sync and invalidate queries
        await syncNow()
        utils.sync.getComments.invalidate({ discussionId })

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating comment:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [syncNow, utils]
  )

  // Delete a comment
  const deleteComment = useCallback(
    async (id: string) => {
      try {
        // Get the discussion ID for the comment
        const comment = await dexieDB.comments.get(id)
        if (!comment) {
          return {
            data: null,
            error: new Error("Comment not found")
          }
        }

        const discussionId = comment.discussionId

        await dexieDB.comments.delete(id)

        // Trigger immediate sync and invalidate queries
        await syncNow()
        utils.sync.getComments.invalidate({ discussionId })

        return { data: true, error: null }
      } catch (err) {
        console.error("Error deleting comment:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [syncNow, utils]
  )

  return {
    note,
    blocks,
    getDiscussions,
    createDiscussion,
    updateDiscussionResolved,
    deleteDiscussion,
    createComment,
    updateComment,
    deleteComment,
    userId
  }
}
