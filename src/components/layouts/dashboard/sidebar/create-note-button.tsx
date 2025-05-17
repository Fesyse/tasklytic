"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { dexieDB } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import { createId } from "@/server/db/schema"
import type { User } from "better-auth"
import type { Organization } from "better-auth/plugins/organization"
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

        console.log(noteId)

        toast.success("Note created successfully")
        router.push(`/dashboard/note/${noteId}`)
      }}
    >
      <FileIcon />
      New note
    </Button>
  )
}

export function createNote(data: { user: User; organization: Organization }) {
  return tryCatch(
    dexieDB.notes.add({
      id: createId(),
      title: "",
      emoji: undefined,
      isPublic: false,
      updatedAt: new Date(),
      updatedByUserId: data.user.id,
      createdByUserId: data.user.id,
      createdAt: new Date(),
      organizationId: data.organization.id
    })
  )
}
