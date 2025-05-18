"use client"

/**
 * Saves the last viewed note ID to localStorage
 */
export function saveLastViewedNote(
  noteId: string,
  organizationId: string
): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(`last-note-id-${organizationId}`, noteId)
  }
}

/**
 * Gets the last viewed note ID from localStorage
 */
export function getLastViewedNote(organizationId: string): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(`last-note-id-${organizationId}`)
  }
  return null
}

/**
 * Clears the last viewed note ID from localStorage
 */
export function clearLastViewedNote(organizationId: string): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(`last-note-id-${organizationId}`)
  }
}
