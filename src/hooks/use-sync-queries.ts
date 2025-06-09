import { authClient } from "@/lib/auth-client"
import { dexieDB, type Note } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import { useSyncContext } from "@/providers/sync-provider"
import { createId } from "@/server/db/schema"
import { useCallback, useEffect, useRef } from "react"
import { useSyncedNote, useSyncedNotes } from "./use-sync"

// Helper for debouncing sync operations
function useDebouncedSync(syncNow: () => Promise<void>, delay = 10000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingSyncRef = useRef<boolean>(false)
  const lastSyncTimeRef = useRef<number>(0)

  const debouncedSync = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set pending sync flag
    pendingSyncRef.current = true

    // Minimum time between syncs to avoid excessive syncing
    const timeSinceLastSync = Date.now() - lastSyncTimeRef.current
    const adjustedDelay =
      timeSinceLastSync < 5000
        ? Math.max(delay, 5000 - timeSinceLastSync)
        : delay

    // Create new timeout
    timeoutRef.current = setTimeout(async () => {
      if (pendingSyncRef.current) {
        lastSyncTimeRef.current = Date.now()
        await syncNow()
        pendingSyncRef.current = false
      }
      timeoutRef.current = null
    }, adjustedDelay)
  }, [syncNow, delay])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        if (pendingSyncRef.current) {
          // fire and forget – don't await inside unmount
          syncNow()
        }
      }
    }
  }, [])

  return debouncedSync
}

/**
 * Hook for working with a single note using the sync layer with tRPC and React Query
 */
export function useSyncedNoteQueries(noteId: string) {
  const { syncNow } = useSyncContext()
  const { note, blocks, isLoading, error, syncStatus } = useSyncedNote(noteId)
  const { data: session } = authClient.useSession()

  // Create a debounced version of the sync function
  const debouncedSync = useDebouncedSync(syncNow)

  // Update the note's title
  const updateNoteTitle = useCallback(
    async (title: string) => {
      if (!session?.user) {
        return {
          data: null,
          error: new Error("User not authenticated")
        }
      }
      if (!note) return { data: null, error: new Error("Note not found") }

      try {
        // Create updated note object
        const updatedNote: Note = {
          ...note,
          title,
          updatedAt: new Date(),
          updatedByUserId: session.user.id,
          updatedByUserName: session.user.name
        }

        // Apply the change locally
        await dexieDB.notes.update(noteId, updatedNote)

        // Trigger debounced sync
        debouncedSync()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating note title:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [note, noteId, debouncedSync]
  )

  // Update note's emoji
  const updateNoteEmoji = useCallback(
    async (emoji: string, emojiSlug: string) => {
      if (!session?.user) {
        return {
          data: null,
          error: new Error("User not authenticated")
        }
      }
      if (!note) return { data: null, error: new Error("Note not found") }

      try {
        // Create updated note object
        const updatedNote: Note = {
          ...note,
          emoji,
          emojiSlug,
          updatedAt: new Date(),
          updatedByUserId: session.user.id,
          updatedByUserName: session.user.name
        }

        // Apply the change locally
        await dexieDB.notes.update(noteId, updatedNote)

        // Use immediate sync for emoji changes rather than debounced sync
        // This ensures the emoji change is pushed to the server immediately
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
    [note, noteId, syncNow]
  )

  // Update note's favorite status
  const updateNoteFavorite = useCallback(
    async (isFavorited: boolean, favoritedByUserId: string | null) => {
      if (!session?.user) {
        return {
          data: null,
          error: new Error("User not authenticated")
        }
      }

      if (!note) return { data: null, error: new Error("Note not found") }

      try {
        // Create updated note object
        const updatedNote: Note = {
          ...note,
          isFavorited,
          favoritedByUserId,
          updatedAt: new Date(),
          updatedByUserName: session.user.name
        }

        // Apply the change locally
        await dexieDB.notes.update(noteId, updatedNote)

        // Use immediate sync for favorite changes rather than debounced sync
        // This ensures the changes are pushed to the server immediately
        await syncNow()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating note favorite status:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [note, noteId, syncNow]
  )

  // Update note's cover
  const updateNoteCover = useCallback(
    async (cover: string | undefined) => {
      if (!session?.user) {
        return {
          data: null,
          error: new Error("User not authenticated")
        }
      }
      if (!note) return { data: null, error: new Error("Note not found") }

      try {
        // Create updated note object
        const updatedNote: Note = {
          ...note,
          cover,
          updatedAt: new Date(),
          updatedByUserId: session.user.id,
          updatedByUserName: session.user.name
        }

        // Apply the change locally
        await dexieDB.notes.update(noteId, updatedNote)
        // Use immediate sync for cover changes
        await syncNow()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating note cover:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [note, noteId, syncNow]
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

        // Trigger debounced sync
        debouncedSync()

        return { data: blockId, error: null }
      } catch (err) {
        console.error("Error creating block:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [note, noteId, debouncedSync]
  )

  // Update a block in the note
  const updateBlock = useCallback(
    async (blockId: string, content: any) => {
      try {
        await dexieDB.blocks.update(blockId, {
          content
        })

        // Trigger debounced sync
        debouncedSync()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating block:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [noteId, debouncedSync]
  )

  // Delete a block from the note
  const deleteBlock = useCallback(
    async (blockId: string) => {
      try {
        await dexieDB.blocks.delete(blockId)

        // Trigger debounced sync
        debouncedSync()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error deleting block:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [noteId, debouncedSync]
  )

  return {
    note,
    blocks,
    isLoading,
    error,
    syncStatus,
    updateNoteTitle,
    updateNoteEmoji,
    updateNoteFavorite,
    updateNoteCover,
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

  // Create a debounced version of the sync function
  const debouncedSync = useDebouncedSync(syncNow)

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
          parentNoteId: parentNoteId ?? null,
          isFavorited: false,
          favoritedByUserId: null
        })

        // Trigger debounced sync
        debouncedSync()

        return { data: noteId, error: null }
      } catch (err) {
        console.error("Error creating note:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [session, organizationId, debouncedSync]
  )

  return {
    notes,
    isLoading,
    error,
    syncStatus,
    createNote
  }
}

/**
 * Hook for working with discussions using the sync layer with tRPC and React Query
 */
export function useSyncedDiscussions(noteId: string) {
  const { syncNow } = useSyncContext()
  const { data: session } = authClient.useSession()

  // Create a debounced version of the sync function
  const debouncedSync = useDebouncedSync(syncNow)

  // Get discussions for a note
  const getDiscussions = useCallback(async () => {
    const { data: discussions, error } = await tryCatch(
      dexieDB.discussions.where("noteId").equals(noteId).toArray()
    )

    if (error) {
      console.error("Error getting discussions:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }

    return { data: discussions, error: null }
  }, [noteId])

  const getDiscussionsWithComments = useCallback(async () => {
    const { data: discussions, error: discussionsError } =
      await getDiscussions()

    if (discussionsError) {
      return { data: null, error: discussionsError }
    }

    const { data: discussionsWithComments, error: commentsError } =
      await tryCatch(
        Promise.all(
          discussions.map(async (discussion) => {
            const comments = await dexieDB.comments
              .where("discussionId")
              .equals(discussion.id)
              .toArray()

            return { ...discussion, comments }
          })
        )
      )

    if (commentsError) {
      console.error("Error getting discussions with comments:", commentsError)
      return {
        data: null,
        error:
          commentsError instanceof Error
            ? commentsError
            : new Error(String(commentsError))
      }
    }

    return { data: discussionsWithComments, error: null }
  }, [noteId])

  // Create a discussion
  const createDiscussion = useCallback(
    async (blockId: string, documentContent?: string) => {
      if (!session?.user) {
        return {
          data: null,
          error: new Error("User not authenticated")
        }
      }

      try {
        const discussionId = createId()
        await dexieDB.discussions.add({
          id: discussionId,
          noteId,
          blockId,
          documentContent,
          updatedAt: new Date(),
          createdAt: new Date(),
          isResolved: false,
          userId: session.user.id
        })

        // Trigger debounced sync
        debouncedSync()

        return { data: discussionId, error: null }
      } catch (err) {
        console.error("Error creating discussion:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [noteId, session, debouncedSync]
  )

  // Update discussion resolved status
  const updateDiscussionResolved = useCallback(
    async (discussionId: string, isResolved: boolean) => {
      try {
        await dexieDB.discussions.update(discussionId, {
          isResolved
        })

        // Trigger debounced sync
        debouncedSync()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating discussion:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [debouncedSync]
  )

  // Delete a discussion
  const deleteDiscussion = useCallback(
    async (discussionId: string) => {
      try {
        await dexieDB.discussions.delete(discussionId)

        // Also delete related comments
        await dexieDB.comments
          .where("discussionId")
          .equals(discussionId)
          .delete()

        // Trigger debounced sync
        debouncedSync()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error deleting discussion:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [debouncedSync]
  )

  // Create a comment
  const createComment = useCallback(
    async (discussionId: string, contentRich: any) => {
      if (!session?.user) {
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
          updatedAt: new Date(),
          createdAt: new Date(),
          isEdited: false,
          userId: session.user.id,
          userImage: session.user.image ?? undefined
        })

        // Trigger debounced sync
        debouncedSync()

        return { data: commentId, error: null }
      } catch (err) {
        console.error("Error creating comment:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [session, debouncedSync]
  )

  // Update a comment
  const updateComment = useCallback(
    async (commentId: string, contentRich: any) => {
      try {
        await dexieDB.comments.update(commentId, {
          contentRich,
          isEdited: true
        })

        // Trigger debounced sync
        debouncedSync()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating comment:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [debouncedSync]
  )

  // Delete a comment
  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        await dexieDB.comments.delete(commentId)

        // Trigger debounced sync
        debouncedSync()

        return { data: true, error: null }
      } catch (err) {
        console.error("Error deleting comment:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [debouncedSync]
  )

  return {
    getDiscussions,
    getDiscussionsWithComments,
    createDiscussion,
    updateDiscussionResolved,
    deleteDiscussion,
    createComment,
    updateComment,
    deleteComment
  }
}
