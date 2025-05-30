"use client"

import { useNoteEditorContext } from "@/contexts/note-editor-context"
import { NoteBreadcrumbs } from "./note-breadcrumbs"
import { NoteNavActions } from "./note-nav-actions"

export function NoteHeader() {
  const { isChanged, isSaving, isAutoSaving } = useNoteEditorContext()

  // Status for display
  const statusText = isSaving
    ? "Saving..."
    : isAutoSaving
      ? "Auto-saving..."
      : isChanged
        ? "Unsaved changes"
        : "Saved"

  return (
    <header className="sticky top-0 left-0 flex w-full justify-between gap-6 p-3">
      <div className="bg-noise flex shrink items-center gap-2 rounded px-2 py-1">
        <NoteBreadcrumbs />
      </div>

      <div className="bg-noise ml-auto flex shrink items-center gap-2 rounded px-3 py-1">
        <div className="text-muted-foreground mr-4 flex items-center gap-2 text-sm">
          <span>{statusText}</span>
        </div>

        <NoteNavActions />
      </div>
    </header>
  )
}
