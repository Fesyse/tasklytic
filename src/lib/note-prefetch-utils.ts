import type { Note } from "./db-client"

/**
 * Gets recently accessed notes from localStorage to help determine which notes to prefetch
 */
export function getRecentlyAccessedNotes(limit: number = 10): string[] {
  if (typeof window === "undefined") return []

  try {
    const recentNotesJson =
      typeof window !== "undefined"
        ? localStorage.getItem("recentlyAccessedNotes")
        : null
    if (!recentNotesJson) return []

    const recentNotes = JSON.parse(recentNotesJson) as string[]
    return recentNotes.slice(0, limit)
  } catch (error) {
    console.error("Error getting recently accessed notes:", error)
    return []
  }
}

/**
 * Tracks a note access by adding it to the beginning of the recently accessed notes list
 */
export function trackNoteAccess(noteId: string): void {
  if (typeof window === "undefined") return

  try {
    const recentNotesJson =
      typeof window !== "undefined"
        ? localStorage.getItem("recentlyAccessedNotes")
        : null
    const recentNotes = recentNotesJson
      ? (JSON.parse(recentNotesJson) as string[])
      : []

    // Remove the noteId if it already exists in the list
    const filteredNotes = recentNotes.filter((id) => id !== noteId)

    // Add the noteId to the beginning of the list
    const updatedNotes = [noteId, ...filteredNotes].slice(0, 20) // Keep only the 20 most recent

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "recentlyAccessedNotes",
        JSON.stringify(updatedNotes)
      )
    }
  } catch (error) {
    console.error("Error tracking note access:", error)
  }
}

/**
 * Function to determine the most likely notes to be accessed next
 * This can be expanded with more sophisticated prediction logic
 */
export function getPotentialNextNotes(
  currentNoteId: string,
  allNotes: Pick<Note, "id" | "parentNoteId">[]
): string[] {
  if (!currentNoteId || !allNotes?.length) return []

  // Get the current note
  const currentNote = allNotes.find((note) => note.id === currentNoteId)
  if (!currentNote) return []

  const potentialNextNotes: string[] = []

  // 1. Child notes of the current note
  const childNotes = allNotes.filter(
    (note) => note.parentNoteId === currentNoteId
  )
  potentialNextNotes.push(...childNotes.map((note) => note.id))

  // 2. Sibling notes (notes with the same parent)
  if (currentNote.parentNoteId) {
    const siblingNotes = allNotes.filter(
      (note) =>
        note.parentNoteId === currentNote.parentNoteId &&
        note.id !== currentNoteId
    )
    potentialNextNotes.push(...siblingNotes.map((note) => note.id))

    // 3. Parent note
    potentialNextNotes.push(currentNote.parentNoteId)
  }

  // 4. Recently accessed notes
  const recentlyAccessedNotes = getRecentlyAccessedNotes(5)
  potentialNextNotes.push(
    ...recentlyAccessedNotes.filter((id) => id !== currentNoteId)
  )

  // Remove duplicates and return
  return [...new Set(potentialNextNotes)]
}
