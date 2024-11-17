"use client"

import { type Note } from "@/server/db/schema"
import { api } from "@/trpc/react"
import debounce from "lodash.debounce"
import { useCallback, type FC } from "react"

type NoteTitleProps = {
  note: Note
}

export const NoteTitle: FC<NoteTitleProps> = ({ note }) => {
  const utils = api.useUtils()
  const { mutateAsync: updateNoteTitle } = api.notes.update.useMutation()

  const updateTitleDebounced = useCallback(
    debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
      await updateNoteTitle({ id: note.id, title: e.target.value })

      await utils.notes.getAll.invalidate()
    }, 750),
    [note.id]
  )

  return (
    <input
      className="border-b bg-transparent pb-2 text-3xl outline-none"
      defaultValue={note.title === "Untitled" ? "" : note.title}
      placeholder="Untitled"
      maxLength={20}
      onChange={updateTitleDebounced}
    />
  )
}
