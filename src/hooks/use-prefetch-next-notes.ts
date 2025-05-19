import { authClient } from "@/lib/auth-client"
import type { Note } from "@/lib/db-client"
import { getNotes } from "@/lib/db-queries"
import {
  getPotentialNextNotes,
  trackNoteAccess
} from "@/lib/note-prefetch-utils"
import { useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { usePrefetchNotes } from "./use-prefetch-notes"

/**
 * Hook to prefetch notes that are likely to be accessed next
 * Uses note hierarchy, recent access patterns, and other heuristics
 */
export function usePrefetchNextNotes() {
  const { noteId } = useParams<{ noteId: string }>()
  const { data: organization } = authClient.useActiveOrganization()
  const { prefetchNote, prefetchMultipleNotes } = usePrefetchNotes()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!noteId || !organization?.id) return

    // Track this note access for future prefetching decisions
    trackNoteAccess(noteId)

    // Function to fetch all notes and determine which ones to prefetch
    const prefetchPotentialNextNotes = async () => {
      try {
        // First, check if we already have the notes in the cache
        const cachedNotes = queryClient.getQueryData<Note[]>([
          "notes",
          organization.id
        ])

        if (cachedNotes) {
          const potentialNextNoteIds = getPotentialNextNotes(
            noteId,
            cachedNotes
          )
          if (potentialNextNoteIds.length > 0) {
            prefetchMultipleNotes(potentialNextNoteIds.map((id) => ({ id })))
          }
          return
        }

        // If we don't have the notes cached, fetch them first
        const { data: allNotes } = await getNotes(organization.id)

        if (allNotes && allNotes.length > 0) {
          // Cache the notes for future prefetching decisions
          queryClient.setQueryData(["notes", organization.id], allNotes)

          // Determine which notes to prefetch
          const potentialNextNoteIds = getPotentialNextNotes(noteId, allNotes)

          // Prefetch those notes
          if (potentialNextNoteIds.length > 0) {
            prefetchMultipleNotes(potentialNextNoteIds.map((id) => ({ id })))
          }
        }
      } catch (error) {
        console.error("Error prefetching potential next notes:", error)
      }
    }

    // Run with a slight delay after the component mounts to prioritize current note loading
    const timer = setTimeout(() => {
      prefetchPotentialNextNotes()
    }, 1000)

    return () => clearTimeout(timer)
  }, [
    noteId,
    organization?.id,
    prefetchNote,
    prefetchMultipleNotes,
    queryClient
  ])
}
