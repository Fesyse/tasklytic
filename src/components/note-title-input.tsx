"use client"

import { useNote } from "@/hooks/use-note"
import { dexieDB } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const MAX_TITLE_LENGTH = 25

export const NoteTitleInput = () => {
  const { data: note } = useNote()
  const [title, setTitle] = useState(note?.title)

  // Handle input changes
  const handleChangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      if (value.length > MAX_TITLE_LENGTH) return
      setTitle(value)
    },
    []
  )

  // Update the note title in the database when the debounced title changes
  useEffect(() => {
    if (!note) return

    const updateTitle = async () => {
      const { error } = await tryCatch(dexieDB.notes.update(note.id, { title }))

      if (error) {
        toast.error(`Failed to update title: ${error.message}`)
      }
    }

    updateTitle()
  }, [title, note?.id])

  useEffect(() => {
    if (!title) return

    document.title = title.length > 0 ? title : "Untitled"
  }, [title])

  useEffect(() => {
    if (!note) return

    setTitle(note.title)
  }, [note?.title])

  return (
    <input
      placeholder="Untitled"
      className="block w-full border-none !bg-transparent p-0 font-sans !text-4xl font-bold outline-none"
      value={title}
      onChange={handleChangeInput}
      maxLength={MAX_TITLE_LENGTH}
      aria-label="Note title"
    />
  )
}
