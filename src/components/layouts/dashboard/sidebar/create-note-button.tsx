"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { createNote } from "@/lib/db-queries"
import { FileIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export const CreateNoteButton = () => {
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full"
      onClick={async () => {
        if (!session || !activeOrganization) return

        const { data: noteId, error } = await createNote({
          organization: activeOrganization,
          user: session.user
        })

        if (error) {
          toast.error("An error occurred while creating the note")
          return
        }

        toast.success("Note created successfully, redirecting...")
        router.push(`/dashboard/note/${noteId}`)
      }}
    >
      <FileIcon />
      New note
    </Button>
  )
}
