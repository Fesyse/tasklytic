"use client"

import { dexieDB, type Note } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import { toast } from "sonner"

export const NoteTitleInput = ({ note }: { note: Note }) => {
  const handleChangeInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    console.log(value)

    const { error } = await tryCatch(
      dexieDB.notes.update(note.id, { title: value })
    )

    if (error) {
      toast.error(error.message)
    }
  }

  return (
    <input
      placeholder="New page"
      className="mx-auto mb-12 block w-full max-w-[44rem] border-none !bg-transparent p-0 font-sans !text-4xl font-bold outline-none"
      defaultValue={note?.title}
      onChange={handleChangeInput}
    />
  )
}
