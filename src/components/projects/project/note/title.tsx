"use client"

import debounce from "lodash.debounce"
import { useParams } from "next/navigation"
import { useCallback, type FC } from "react"
import { useRevalidateSidebar } from "@/hooks/use-revalidate-sidebar"
import { type Note } from "@/server/db/schema"
import { api } from "@/trpc/react"

type NoteTitleProps = {
  note: Note
}

export const NoteTitle: FC<NoteTitleProps> = ({ note }) => {
  const { projectId } = useParams<{ projectId: string }>()
  const { mutateAsync: updateNoteTitle } = api.notes.update.useMutation()
  const invalidateSidebar = useRevalidateSidebar(projectId)

  const updateTitleDebounced = useCallback(
    debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!note || e.target.value === note.title) return

      const title = e.target.value.length === 0 ? "Untitled" : e.target.value

      await updateNoteTitle({ id: note.id, title })
      await invalidateSidebar()
    }, 750),
    [note?.id]
  )

  return (
    <input
      className="w-full border-b bg-transparent pb-2 text-4xl outline-hidden"
      defaultValue={note?.title === "Untitled" ? "" : (note?.title ?? "")}
      placeholder="Untitled"
      maxLength={20}
      onChange={updateTitleDebounced}
    />
  )
}
