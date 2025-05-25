import { authClient } from "@/lib/auth-client"
import { type Comment, type Discussion } from "@/lib/db-client"
import { useCallback, useEffect, useState } from "react"
import { useSyncedDiscussions } from "./use-sync-queries"

export interface TDiscussionWithComments extends Discussion {
  comments: Comment[]
}

export function useDiscussions(noteId: string) {
  const session = authClient.useSession()
  const userName = session.data?.user.name ?? ""
  const [discussions, setDiscussions] = useState<TDiscussionWithComments[]>([])
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true)

  // Use the sync-powered discussions hook
  const {
    getDiscussionsWithComments,
    createDiscussion,
    updateDiscussionResolved,
    deleteDiscussion,
    createComment,
    updateComment,
    deleteComment
  } = useSyncedDiscussions(noteId)

  // Load discussions initially and set up automatic updates
  useEffect(() => {
    const loadDiscussions = async () => {
      setIsLoadingDiscussions(true)
      const { data, error } = await getDiscussionsWithComments()
      if (data) {
        setDiscussions(data)
      }
      if (error) {
        console.error("Error loading discussions:", error)
      }
      setIsLoadingDiscussions(false)
    }

    loadDiscussions()

    // Set up an interval to periodically refresh discussions
    const interval = setInterval(loadDiscussions, 5000)
    return () => clearInterval(interval)
  }, [getDiscussionsWithComments])

  // Create a new discussion
  const addDiscussion = useCallback(
    async (blockId: string, documentContent: string) => {
      const { data: discussionId } = await createDiscussion(
        blockId,
        documentContent
      )

      // Refresh discussions after creating a new one
      if (discussionId) {
        const { data } = await getDiscussionsWithComments()
        if (data) {
          setDiscussions(data)
        }
      }

      return discussionId
    },
    [createDiscussion, getDiscussionsWithComments]
  )

  // Add a comment to a discussion
  const addComment = useCallback(
    async (discussionId: string, contentRich: any) => {
      const { data: commentId } = await createComment(discussionId, contentRich)

      // Refresh discussions after adding a comment
      if (commentId) {
        const { data } = await getDiscussionsWithComments()
        if (data) {
          setDiscussions(data)
        }
      }

      return commentId
    },
    [createComment, getDiscussionsWithComments]
  )

  // Update a comment
  const updateCommentContent = useCallback(
    async (commentId: string, contentRich: any) => {
      const { data } = await updateComment(commentId, contentRich)

      // Refresh discussions after updating a comment
      if (data) {
        const { data: refreshedData } = await getDiscussionsWithComments()
        if (refreshedData) {
          setDiscussions(refreshedData)
        }
      }

      return data
    },
    [updateComment, getDiscussionsWithComments]
  )

  // Delete a comment
  const removeComment = useCallback(
    async (commentId: string) => {
      const { data } = await deleteComment(commentId)

      // Refresh discussions after deleting a comment
      if (data) {
        const { data: refreshedData } = await getDiscussionsWithComments()
        if (refreshedData) {
          setDiscussions(refreshedData)
        }
      }

      return data
    },
    [deleteComment, getDiscussionsWithComments]
  )

  // Resolve a discussion
  const resolveDiscussion = useCallback(
    async (discussionId: string) => {
      const { data } = await updateDiscussionResolved(discussionId, true)

      // Refresh discussions after resolving a discussion
      if (data) {
        const { data: refreshedData } = await getDiscussionsWithComments()
        if (refreshedData) {
          setDiscussions(refreshedData)
        }
      }

      return data
    },
    [updateDiscussionResolved, getDiscussionsWithComments]
  )

  // Delete a discussion
  const removeDiscussion = useCallback(
    async (discussionId: string) => {
      const { data } = await deleteDiscussion(discussionId)

      // Refresh discussions after deleting a discussion
      if (data) {
        const { data: refreshedData } = await getDiscussionsWithComments()
        if (refreshedData) {
          setDiscussions(refreshedData)
        }
      }

      return data
    },
    [deleteDiscussion, getDiscussionsWithComments]
  )

  return {
    discussions,
    isLoadingDiscussions,
    addDiscussion,
    addComment,
    updateCommentContent,
    removeComment,
    resolveDiscussion,
    removeDiscussion,
    userName
  }
}
