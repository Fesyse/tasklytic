import { Pin } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import { NoteButton } from "./note-button"
import { SidebarNav } from "@/lib/sidebar"

export function NavPinnedNotes({
  pinnedNotes
}: {
  pinnedNotes: SidebarNav["pinnedNotes"]
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="flex items-center gap-1.5">
        <Pin className="-rotate-45" size={14} /> Pinned notes
      </SidebarGroupLabel>
      <SidebarMenu>
        {!pinnedNotes.isLoading && pinnedNotes.items?.length ? (
          pinnedNotes.items.map(note => (
            <NoteButton key={note.id} note={note} />
          ))
        ) : pinnedNotes.isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))
        ) : (
          <SidebarMenuItem className="justify-center">
            <span className="ml-2 text-xs text-muted-foreground">
              No pinned notes
            </span>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
