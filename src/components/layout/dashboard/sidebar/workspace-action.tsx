"use client"

import {
  ChevronRight,
  FileIcon,
  FolderIcon,
  Plus,
  Presentation
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { SidebarGroupAction } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { importFile } from "@/lib/utils"
import { api } from "@/trpc/react"

export const WorkspaceAction = () => {
  const isMobile = useIsMobile()
  const utils = api.useUtils()
  const router = useRouter()

  const { projectId } = useParams<{ projectId: string }>()

  const { mutate: createNote, isPending: isNoteCreating } =
    api.notes.create.useMutation({
      onSuccess: async note => {
        utils.notes.getAll.invalidate()
        toast.success(`Successfully created note!`)
        router.push(`/projects/${projectId}/note/${note.id}`)
      },
      onError: () => toast.error("An error occurred creating note! Try again.")
    })

  const { mutate: createFolder, isPending: isFolderCreating } =
    api.folders.create.useMutation({
      onSuccess: async folder => {
        utils.folders.getAll.invalidate()
        toast.success(`Successfully created folder!`)

        if (!folder) return
        router.push(`/projects/${projectId}/folder/${folder.id}`)
      },
      onError: () =>
        toast.error("An error occurred creating folder! Try again.")
    })

  const importNote = () => {
    importFile(reader => {
      try {
        const content = JSON.parse(reader.result as string)

        createNote({ projectId, content })
      } catch {
        toast.error("Failed to import note! File is probably corrupted.")
      }
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarGroupAction>
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
          onClick={() => createFolder({ projectId })}
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
