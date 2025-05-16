"use client"

import { dexieDB } from "@/lib/db-client"
import { useLiveQuery } from "dexie-react-hooks"
import { useParams } from "next/navigation"
import { PlateEditor } from "./editor/plate-editor"
import { SettingsProvider } from "./editor/settings"

export const NoteEditor = () => {
  const { noteId } = useParams<{ noteId: string }>()
  const note = useLiveQuery(() => dexieDB.notes.get(noteId))

  return (
    <SettingsProvider>
      <input
        placeholder="New page"
        className="mx-auto mb-12 block w-full max-w-[44rem] border-none !bg-transparent p-0 font-sans !text-4xl font-bold outline-none"
      />
      <PlateEditor />
    </SettingsProvider>
  )
}
