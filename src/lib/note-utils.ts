"use client"

/**
 * Saves the last viewed note ID to localStorage
 */
export function saveLastViewedNote(noteId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("last-note-id", noteId)
  }
}

/**
 * Gets the last viewed note ID from localStorage
 */
export function getLastViewedNote(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("last-note-id")
  }
  return null
}

/**
 * Clears the last viewed note ID from localStorage
 */
export function clearLastViewedNote(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("last-note-id")
  }
}
