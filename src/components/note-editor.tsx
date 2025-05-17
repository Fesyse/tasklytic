"use client"

import { dexieDB } from "@/lib/db-client"
import { useDexieDb } from "@/lib/use-dexie-db"
import { notFound, useParams } from "next/navigation"
import { PlateEditor } from "./editor/plate-editor"
import { SettingsProvider } from "./editor/settings"

export const NoteEditor = () => {
  const { noteId } = useParams<{ noteId: string }>()

  const { data, isLoading, isError } = useDexieDb(async () => {
    const note = await dexieDB.notes.where("id").equals(noteId).first()
    const blocks = await dexieDB.blocks.where("noteId").equals(noteId).toArray()

    return { ...note, blocks: blocks.map((block) => block.content) }
  })

  if (isError) return notFound()
  const note = data as NonNullable<typeof data>

  return (
    <SettingsProvider>
      <input
        placeholder="New page"
        className="mx-auto mb-12 block w-full max-w-[44rem] border-none !bg-transparent p-0 font-sans !text-4xl font-bold outline-none"
      />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <PlateEditor defaultValue={note.blocks} />
      )}
    </SettingsProvider>
  )
}
