"use client"

import { FileUp } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { FolderButton } from "./folder-button"
import { NoteButton } from "./note-button"
import { SidebarNav } from "@/lib/sidebar"
import { api } from "@/trpc/react"

type NavWorkspaceProps = {
  workspace: SidebarNav["workspace"]
}

export const NavWorkspace: React.FC<NavWorkspaceProps> = ({ workspace }) => {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()
  const utils = api.useUtils()

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
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarGroupAction
            // onClick={() => createFolder({ projectId })}
            >
              {/* {isFolderCreating ? <LoadingSpinner /> : <Plus />} */}
              <span className="sr-only">Add Folder or Note</span>
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
          {workspace.items?.length && !workspace.isLoading ? (
            workspace.items.map(item =>
              item.type === "note" ? (
                <NoteButton key={item.id} note={item} />
              ) : (
                <FolderButton key={item.id} folder={item} />
              )
            )
          ) : workspace.isLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            ))
          ) : (
            <SidebarMenuItem>
              <span className="ml-2 text-xs text-muted-foreground">
                No results
              </span>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
