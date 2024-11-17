import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/lib/menu-list"
import { api } from "@/trpc/react"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export function NavNotes({ notes }: { notes: SidebarNav["notes"] }) {
  const { id: projectId } = useParams<{ id: string }>()
  const router = useRouter()

  const { mutateAsync: createNote, isPending: isNoteCreating } =
    api.notes.create.useMutation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Notes</SidebarGroupLabel>
      <SidebarGroupAction
        title="Add Note"
        onClick={async () => {
          const note = await createNote({ projectId })

          toast.success(`Successfully created note!`)
          router.push(`/projects/${projectId}/${note.id}`)
        }}
      >
        {isNoteCreating ? <LoadingSpinner /> : <Plus />}{" "}
        <span className="sr-only">Add Note</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {notes.items?.length && !notes.isLoading ? (
            notes.items.map(note => (
              <SidebarMenuItem key={note.id}>
                <SidebarMenuButton asChild>
                  <Link href={note.href}>
                    <span>
                      <note.emoji />
                    </span>
                    <span>{note.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
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
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <DotsHorizontalIcon />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
