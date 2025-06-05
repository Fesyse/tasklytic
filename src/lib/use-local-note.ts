import { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import { useParams } from "next/navigation"

/**
 * Hook that loads a note from the client DB with server synchronization
 * This is a wrapper around useSyncedNoteQueries to maintain backward compatibility
 */
export function useLocalNote() {
  const { noteId } = useParams<{ noteId: string }>()
  const { note, isLoading, error } = useSyncedNoteQueries(noteId)

  // Return in the same format as before for backward compatibility
  return {
    data: note,
    isLoading,
    error
  }
}
