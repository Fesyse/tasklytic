"use client"

import { dexieDB, type Note } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const MAX_TITLE_LENGTH = 25

export const NoteTitleInput = ({ note }: { note: Note }) => {
  const [title, setTitle] = useState(note.title)

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
    const updateTitle = async () => {
      // Don't update if the title hasn't changed
      if (title === note.title) return

      const { error } = await tryCatch(dexieDB.notes.update(note.id, { title }))

      if (error) {
        toast.error(`Failed to update title: ${error.message}`)
      }
    }

    updateTitle()
  }, [title, note.id, note.title])

  useEffect(() => {
    document.title = title.length > 0 ? title : "Untitled"
  }, [title])

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
