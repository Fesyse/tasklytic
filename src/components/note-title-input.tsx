"use client"

import { dexieDB, type Note } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const MAX_TITLE_LENGTH = 25

export const NoteTitleInput = ({ note }: { note: Note }) => {
  const [title, setTitle] = useState(note.title)

  const handleChangeInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      if (value.length > MAX_TITLE_LENGTH) return

      setTitle(value)
      const { error } = await tryCatch(
        dexieDB.notes.update(note.id, { title: value })
      )

      if (error) {
        toast.error(error.message)
      }
    },
    [dexieDB, note.id]
  )

  useEffect(() => {
    document.title = title.length > 0 ? title : "Untitled"
  }, [title])

  return (
    <input
      placeholder="Untitled"
      className="block w-full border-none !bg-transparent p-0 font-sans !text-4xl font-bold outline-none"
      defaultValue={note?.title}
      onChange={handleChangeInput}
      maxLength={MAX_TITLE_LENGTH}
    />
  )
}
