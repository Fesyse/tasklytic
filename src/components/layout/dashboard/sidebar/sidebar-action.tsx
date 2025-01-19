"use client"

import {
  ChevronRight,
  FileIcon,
  FolderIcon,
  Plus,
  Presentation
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React, { useCallback } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
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
      utils.notes.getAll.invalidate()
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
    <Popover>
      <PopoverTrigger asChild>
        <SidebarGroupAction className={className}>
          <Plus size={18} />
          <span className="sr-only">Add Folder or Note</span>
        </SidebarGroupAction>
      </PopoverTrigger>
      <PopoverContent
        className="flex-col flex gap-1.5 max-w-fit py-2 px-2.5"
        side="right"
      >
        <Button
          className="justify-start gap-1"
          size="sm"
          variant="secondary"
          onClick={() => createFolder({ projectId, folderId })}
        >
          <FolderIcon size={16} /> Create Folder
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button className="justify-start gap-1" size="sm">
              <FileIcon size={16} /> Create Note{" "}
              <ChevronRight className="left-1" size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="flex-col flex gap-1.5 max-w-fit py-2 px-2.5 ml-4"
            side="right"
          >
            <Button
              className="justify-start gap-1"
              size="sm"
              onClick={() => createNote({ projectId })}
            >
              <Presentation size={16} /> Blank
            </Button>
            <Button
              className="justify-start gap-1"
              size="sm"
              variant="secondary"
              onClick={importNote}
            >
              <FileIcon size={16} /> Import
            </Button>
          </PopoverContent>
        </Popover>
      </PopoverContent>
    </Popover>
  )
}
