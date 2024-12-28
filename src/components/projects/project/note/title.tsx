"use client"

import debounce from "lodash.debounce"
import { useCallback, type FC } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"

type NoteTitleProps = {
  noteId: string
}

export const NoteTitle: FC<NoteTitleProps> = ({ noteId }) => {
  const utils = api.useUtils()
  const { data: note, isLoading } = api.notes.getById.useQuery({ id: noteId })
  const { mutateAsync: updateNoteTitle } = api.notes.update.useMutation()

  const updateTitleDebounced = useCallback(
    debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!note) return
      if (e.target.value === note.title) return
      const title = e.target.value.length === 0 ? "Untitled" : e.target.value
      console.log(title)

      await updateNoteTitle({ id: note.id, title })

      await Promise.all([
        utils.notes.getById.invalidate({ id: note.id }),
        utils.notes.getAll.invalidate()
      ])
    }, 750),
    [note?.id]
  )

  return isLoading ? (
    <Skeleton className="h-10 w-44" />
  ) : (
    <input
      className="w-full border-b bg-transparent pb-2 text-4xl outline-none"
      defaultValue={note?.title === "Untitled" ? "" : (note?.title ?? "")}
      placeholder="Untitled"
      maxLength={20}
      onChange={updateTitleDebounced}
    />
  )
}
