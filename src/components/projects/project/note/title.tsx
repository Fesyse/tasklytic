"use client"

import debounce from "lodash.debounce"
import { useParams } from "next/navigation"
import { useCallback, type FC } from "react"
import { type Note } from "@/server/db/schema"
import { api } from "@/trpc/react"

type NoteTitleProps = {
  note: Note
}

export const NoteTitle: FC<NoteTitleProps> = ({ note }) => {
  const { projectId } = useParams<{ projectId: string }>()
  const utils = api.useUtils()
  const { mutateAsync: updateNoteTitle } = api.notes.update.useMutation()

  const updateTitleDebounced = useCallback(
    debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!note || e.target.value === note.title) return

      const title = e.target.value.length === 0 ? "Untitled" : e.target.value

      await updateNoteTitle({ id: note.id, title })
      await Promise.all([
        utils.notes.getById.invalidate({ id: note.id }),
        utils.folders.getWorkspace.invalidate({ projectId }),
        utils.notes.getAll.invalidate({ projectId }),
        utils.notes.getAllRoot.invalidate({ projectId })
      ])
    }, 750),
    [note?.id]
  )

  return (
    <input
      className="w-full border-b bg-transparent pb-2 text-4xl outline-none"
      defaultValue={note?.title === "Untitled" ? "" : (note?.title ?? "")}
      placeholder="Untitled"
      maxLength={20}
      onChange={updateTitleDebounced}
    />
  )
}
