"use client"

import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { BorderTrail } from "@/components/ui/border-trail"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"

type CreateNoteButtonWrapperProps = React.PropsWithChildren<{
  className?: string
}>

export const CreateNoteButtonWrapper: React.FC<
  CreateNoteButtonWrapperProps
> = ({ className, children }) => {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()

  const utils = api.useUtils()
  const { mutate: createNote, isPending } = api.notes.create.useMutation({
    onSuccess: async note => {
      await Promise.all([
        utils.folders.getWorkspace.invalidate({ projectId }),
        utils.notes.getAll.invalidate({ projectId }),
        utils.notes.getAllRoot.invalidate({ projectId })
      ])
      toast.success(`Successfully created note!`)
      router.push(`/projects/${projectId}/note/${note.id}`)
    },
    onError: () => toast.error("An error occurred creating note! Try again.")
  })

  return (
    <button
      className={cn("text-left", className)}
      onClick={() => createNote({ projectId })}
    >
      <BorderTrail
        className={cn(
          "bg-gradient-to-l from-green-300 via-green-500 to-green-300 transition-opacity duration-300 dark:from-green-700/30 dark:via-green-500 dark:to-green-700/30",
          isPending ? "opacity-100" : "opacity-0"
        )}
        size={120}
        transition={{
          ease: [0, 0.5, 0.8, 0.5],
          duration: 4,
          repeat: 2
        }}
      />
      {children}
    </button>
  )
}
