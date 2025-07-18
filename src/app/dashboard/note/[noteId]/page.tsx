"use client"

import { NoteEditor, NoteEditorProvider } from "@/components/note/note-editor"

export default function NotePage() {
  return (
    <div className="bg-noise h-screen w-full" data-registry="plate">
      <NoteEditorProvider>
        <NoteEditor />
      </NoteEditorProvider>
    </div>
  )
}
