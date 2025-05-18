import { authClient } from "@/lib/auth-client"
import { type Comment, type Discussion } from "@/lib/db-client"
import {
  createComment,
  createDiscussion,
  deleteComment,
  deleteDiscussion,
  getComments,
  getDiscussions,
  updateComment,
  updateDiscussionResolved
} from "@/lib/db-queries"
import { useDexieDb } from "@/lib/use-dexie-db"
import { type Value } from "@udecode/plate"
import { useCallback } from "react"

export interface TDiscussionWithComments extends Discussion {
  comments: Comment[]
}

export function useDiscussions(noteId: string) {
  const session = authClient.useSession()
  const userId = session.data?.user.id || ""
  const userName = session.data?.user.name || ""

  // Get discussions for the note
  const { data: discussions = [], isLoading: isLoadingDiscussions } =
    useDexieDb(async () => {
      const { data: discussionsData } = await getDiscussions(noteId)
      if (!discussionsData) return []

      // Get comments for each discussion
      const discussionsWithComments: TDiscussionWithComments[] =
        await Promise.all(
          discussionsData.map(async (discussion) => {
            const { data: commentsData } = await getComments(discussion.id)
            return {
              ...discussion,
              comments: commentsData || []
            }
          })
        )

      return discussionsWithComments
    }, [noteId])

  // Create a new discussion
  const addDiscussion = useCallback(
    async (blockId: string, documentContent: string, contentRich: Value) => {
      if (!userId) return null

      // Create the discussion
      const { data: discussionId } = await createDiscussion({
        noteId,
        blockId,
        documentContent,
        userId
      })

      if (!discussionId) return null

      // Create the first comment
      await createComment({
        discussionId,
        contentRich,
        userId
      })

      return discussionId
    },
    [noteId, userId]
  )

  // Add a comment to a discussion
  const addComment = useCallback(
    async (discussionId: string, contentRich: Value) => {
      if (!userId) return null

      const { data: commentId } = await createComment({
        discussionId,
        contentRich,
        userId
      })

      return commentId
    },
    [userId]
  )

  // Update a comment
  const updateCommentContent = useCallback(
    async (commentId: string, contentRich: Value) => {
      const { data } = await updateComment(commentId, contentRich)
      return data
    },
    []
  )

  // Delete a comment
  const removeComment = useCallback(async (commentId: string) => {
    const { data } = await deleteComment(commentId)
    return data
  }, [])

  // Resolve a discussion
  const resolveDiscussion = useCallback(async (discussionId: string) => {
    const { data } = await updateDiscussionResolved(discussionId, true)
    return data
  }, [])

  // Delete a discussion
  const removeDiscussion = useCallback(async (discussionId: string) => {
    const { data } = await deleteDiscussion(discussionId)
    return data
  }, [])

  return {
    discussions,
    isLoadingDiscussions,
    addDiscussion,
    addComment,
    updateCommentContent,
    removeComment,
    resolveDiscussion,
    removeDiscussion,
    userId,
    userName
  }
}
