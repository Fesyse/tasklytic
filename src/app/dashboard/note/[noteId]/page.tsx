"use client"

import { NoteEditor } from "@/components/note-editor"
import { usePrefetchNextNotes } from "@/hooks/use-prefetch-next-notes"

export default function NotePage() {
  // This hook will prefetch notes that are likely to be accessed next
  usePrefetchNextNotes()

  return (
    <div className="bg-noise h-screen w-full" data-registry="plate">
      <NoteEditor />
    </div>
  )
}
