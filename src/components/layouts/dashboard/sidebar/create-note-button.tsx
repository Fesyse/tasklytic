"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { dexieDB } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import { createId } from "@/server/db/schema"
import { FileIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export const CreateNoteButton = () => {
  const { data: session } = authClient.useSession()
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full"
      onClick={async () => {
        if (!session) return

        const { data: noteId, error } = await tryCatch(
          dexieDB.notes.add({
            id: createId(),
            title: "",
            emoji: undefined,
            isPublic: false,
            updatedAt: new Date(),
            updatedByUserId: session.user.id,
            createdByUserId: session.user.id,
            createdAt: new Date()
          })
        )

        if (error) {
          toast.error("An error occurred while creating the note")
          return
        }

        console.log(noteId)

        toast.success("Note created successfully")
        router.push(`/dashboard/note/${noteId}`)
      }}
    >
      <FileIcon />
      New page
    </Button>
  )
}
