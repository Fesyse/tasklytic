import { useQuery, useQueryClient } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"
import { getNoteWithBlocks } from "@/lib/db-queries"
import { useParams } from "next/navigation"
import { useEffect } from "react"

export function useNote() {
  const { noteId } = useParams<{ noteId: string }>()
  const { data: organization } = authClient.useActiveOrganization()
  const queryClient = useQueryClient()

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

  // Set up a listener for Dexie changes to invalidate the cache when the note is updated
  useEffect(() => {
    if (!noteId || !organization?.id) return

    const invalidateCache = () => {
      queryClient.invalidateQueries({
        queryKey: ["note", noteId, organization.id]
      })
    }

    // You could set up a more sophisticated Dexie observer here if needed

    return () => {
      // Clean up any observers if needed
    }
  }, [noteId, organization?.id, queryClient])

  return result
}
