import { useQuery } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"
import { getNoteWithBlocks } from "@/lib/db-queries"
import { useParams } from "next/navigation"

export function useNote() {
  const { noteId } = useParams<{ noteId: string }>()
  const { data: organization } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ["note", noteId, organization?.id],
    queryFn: async () => {
      const { data, error } = await getNoteWithBlocks(noteId, organization!.id)
      if (error) throw error
      return data
    },
    enabled: !!organization?.id
  })
}
