import { authClient } from "@/lib/auth-client"
import type { Note } from "@/lib/db-client"
import { getNoteWithBlocks } from "@/lib/db-queries"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

export function usePrefetchNotes() {
  const queryClient = useQueryClient()
  const { data: organization } = authClient.useActiveOrganization()

  const prefetchNote = useCallback(
    async (noteId: string) => {
      if (!organization?.id) return

      // Skip prefetching if the note is already in the cache and not stale
      const cachedNote = queryClient.getQueryData([
        "note",
        noteId,
        organization.id
      ])
      if (cachedNote) return

      await queryClient.prefetchQuery({
        queryKey: ["note", noteId, organization.id],
        queryFn: async () => {
          const { data, error } = await getNoteWithBlocks(
            noteId,
            organization.id
          )
          if (error) throw error
          return data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30 // 30 minutes
      })
    },
    [organization?.id, queryClient]
  )

  const prefetchMultipleNotes = useCallback(
    async (notes: Pick<Note, "id">[]) => {
      // Prefetch multiple notes in parallel, limiting concurrency to 3
      const batchSize = 3

      for (let i = 0; i < notes.length; i += batchSize) {
        const batch = notes.slice(i, i + batchSize)

        await Promise.all(batch.map((note) => prefetchNote(note.id)))
      }
    },
    [prefetchNote]
  )

  return {
    prefetchNote,
    prefetchMultipleNotes
  }
}
