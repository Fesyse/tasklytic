import { useQuery, useQueryClient } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"
import { getNoteWithBlocks } from "@/lib/db-queries"
import { useLiveQuery } from "dexie-react-hooks"
import { useParams } from "next/navigation"
import { useEffect } from "react"

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
