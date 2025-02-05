"use client"

import { FileIcon, FolderIcon, Plus, Presentation } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React, { useCallback } from "react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { SidebarGroupAction } from "@/components/ui/sidebar"
import { importFile } from "@/lib/utils"
import { api } from "@/trpc/react"

type WorkspaceActionProps = {
  folderId?: string
  className?: string
}

export const SidebarAction: React.FC<WorkspaceActionProps> = ({
  folderId,
  className
}) => {
  const utils = api.useUtils()
  const router = useRouter()

  const { projectId } = useParams<{ projectId: string }>()

  const invalidate = useCallback(() => {
    return Promise.all([
      utils.folders.getWorkspace.invalidate({ projectId }),
      utils.notes.getAll.invalidate({ projectId }),
      utils.notes.getAllRoot.invalidate({ projectId })
    ])
  }, [utils])

  const { mutate: createNote } = api.notes.create.useMutation({
    onSuccess: async note => {
      await invalidate()
      toast.success(`Successfully created note!`)
      router.push(`/projects/${projectId}/note/${note.id}`)
    },
    onError: () => toast.error("An error occurred creating note! Try again.")
  })

  const { mutate: createFolder } = api.folders.create.useMutation({
    onSuccess: async () => {
      await invalidate()
      toast.success(`Successfully created folder!`)
    },
    onError: () => toast.error("An error occurred creating folder! Try again.")
  })

  const importNote = () => {
    importFile(reader => {
      try {
        const content = JSON.parse(reader.result as string)
        createNote({ projectId, content, folderId })
      } catch {
        toast.error("Failed to import note! File is probably corrupted.")
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <SidebarGroupAction className={className}>
          <Plus size={18} />
          <span className="sr-only">Add Folder or Note</span>
        </SidebarGroupAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right">
        <DropdownMenuLabel>Add new folder/note</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex gap-1.5 items-center"
            onClick={() => createFolder({ projectId, folderId })}
          >
            <FolderIcon size={16} /> Create Folder
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex gap-1.5 items-center">
              <FileIcon size={16} /> Create Note
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="max-w-fit">
                <DropdownMenuItem
                  className="flex gap-1.5 items-center"
                  onClick={() => createNote({ projectId, folderId })}
                >
                  <Presentation size={16} /> Blank
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex gap-1.5 items-center"
                  onClick={importNote}
                >
                  <FileIcon size={16} /> Import
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
