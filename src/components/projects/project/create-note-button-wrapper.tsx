"use client"

import { useParams } from "next/navigation"
import { api } from "@/trpc/react"

export const CreateNoteButtonWrapper: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const { projectId } = useParams<{ projectId: string }>()
  const { mutate: createNote } = api.notes.create.useMutation()

  return (
    <button className="text-left" onClick={() => createNote({ projectId })}>
      {children}
    </button>
  )
}
