"use client"

import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/trpc/react"

export const CreateNoteButtonWrapper: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()

  const utils = api.useUtils()
  const { mutate: createNote } = api.notes.create.useMutation({
    onSuccess: async note => {
      utils.notes.getAll.invalidate()
      toast.success(`Successfully created note!`)
      router.push(`/projects/${projectId}/note/${note.id}`)
    },
    onError: () => toast.error("An error occurred creating note! Try again.")
  })

  return (
    <button className="text-left" onClick={() => createNote({ projectId })}>
      {children}
    </button>
  )
}
