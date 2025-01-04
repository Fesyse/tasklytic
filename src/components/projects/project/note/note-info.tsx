import React from "react"
import { NoteEmojiPicker } from "./emoji-picker"
import { NoteTitle } from "./title"
import { api } from "@/trpc/server"

type NoteInfoProps = {
  noteId: string
}

export const NoteInfo: React.FC<NoteInfoProps> = async ({ noteId }) => {
  const note = await api.notes.getById({ id: noteId })

  if (!note) return null

  return (
    <>
      <NoteEmojiPicker note={note} />
      <NoteTitle note={note} />
    </>
  )
}
