import { useQuery, useQueryClient } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"
import type { Note } from "@/lib/db-client"
import { getNoteWithBlocks } from "@/lib/db-queries"
import { useLiveQuery } from "dexie-react-hooks"
import { useParams } from "next/navigation"
import { useCallback, useEffect } from "react"
import { toast } from "sonner"

export function useNote() {
  const queryClient = useQueryClient()
  const { noteId } = useParams<{ noteId: string }>()
  const { data: organization } = authClient.useActiveOrganization()

  const result = useQuery({
    queryKey: ["note", noteId, organization?.id],
    queryFn: async () => {
      const { data, error } = await getNoteWithBlocks(noteId, organization!.id)
      if (error) throw error
      return data
    },
    enabled: !!organization?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    placeholderData: (oldData) => oldData, // Keep displaying previous note data while loading the new one
    refetchOnWindowFocus: false // Disable refetching on window focus to prevent unnecessary loading
  })

  const liveNote = useLiveQuery(async () => {
    if (!organization?.id) return undefined

    const { data, error } = await getNoteWithBlocks(noteId, organization!.id)
    if (error) return undefined
    return data
  }, [noteId, organization?.id])

  useEffect(() => {
    if (liveNote) {
      queryClient.setQueryData(["note", noteId, organization?.id], liveNote)
    }
  }, [liveNote, noteId, organization?.id, queryClient])

  return result
}

export function useToggleFavorite({
  note,
  updateNoteFavorite
}: {
  note: Note | undefined
  updateNoteFavorite: (
    isFavorited: boolean,
    favoritedByUserId: string | null
  ) => Promise<{ error: any }>
}) {
  const queryClient = useQueryClient()
  const { data: organization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()

  const handleToggleFavorite = useCallback(async () => {
    if (!note || !organization || !session) return

    const newFavoritedState = !note.isFavorited

    updateNoteFavorite(
      newFavoritedState,
      newFavoritedState ? session.user.id : null
    )
      .then(({ error }) => {
        if (error) {
          toast.error("Failed to update favorite status")
          console.error(error)
          return
        }

        // Optimistically update the cache
        queryClient.setQueryData(
          ["note", note.id, organization.id],
          (old: Note | undefined) =>
            old
              ? {
                  ...old,
                  isFavorited: newFavoritedState,
                  favoritedByUserId: newFavoritedState ? session.user.id : null
                }
              : old
        )

        toast.success(
          newFavoritedState ? "Added to favorites" : "Removed from favorites"
        )
      })
      .catch((error) => {
        toast.error("Failed to update favorite status")
        console.error(error)
      })
  }, [note, organization, session, updateNoteFavorite, queryClient])

  return { handleToggleFavorite }
}
