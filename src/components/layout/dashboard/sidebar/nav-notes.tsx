"use client"

import { FileUp, Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { importFile } from "@/lib/utils"
import { NoteButton } from "./note-button"
import { SidebarNote } from "@/lib/sidebar"
import { api } from "@/trpc/react"

export function NavNotes({
  notes
}: {
  notes: { items: SidebarNote[]; isLoading: boolean }
}) {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()
  const utils = api.useUtils()

  const { mutate: createNote, isPending: isNoteCreating } =
    api.notes.create.useMutation({
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
    <SidebarGroup>
      <SidebarGroupLabel>Notes</SidebarGroupLabel>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarGroupAction onClick={() => createNote({ projectId })}>
              {isNoteCreating ? <LoadingSpinner /> : <Plus />}
              <span className="sr-only">Add Note</span>
            </SidebarGroupAction>
          </TooltipTrigger>
          <TooltipContent className="px-2 py-1" side="right" asChild>
            <Button onClick={importNote} className="gap-1.5">
              <FileUp size={16} /> Import from{" "}
              <span className="italic">.json.taly</span> file
            </Button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SidebarGroupContent>
        <SidebarMenu>
          {notes.items?.length && !notes.isLoading ? (
            notes.items.map(note => <NoteButton key={note.id} note={note} />)
          ) : notes.isLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            ))
          ) : (
            <SidebarMenuItem>
              <span className="ml-2 text-xs text-muted-foreground">
                No notes
              </span>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
