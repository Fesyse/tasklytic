import { authClient } from "./auth-client"

import { useParams } from "next/navigation"
import { getNote } from "./db-queries"
import { useDexieDb } from "./use-dexie-db"

export function useLocalNote() {
  const { noteId } = useParams<{ noteId: string }>()
  const { data: activeOrganization } = authClient.useActiveOrganization()

  return useDexieDb(async () => {
    if (!activeOrganization) return undefined
    const { data, error } = await getNote(noteId, activeOrganization.id)

    if (error) {
      console.error(error)
      return
    }

    return data
  }, [activeOrganization?.id, noteId])
}
