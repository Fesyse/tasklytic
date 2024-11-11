import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/lib/menu-list"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import Link from "next/link"

export function NavNotes({ notes }: { notes: SidebarNav["notes"] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Notes</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {notes.items?.length && !notes.isLoading ? (
            notes.items.map(note => (
              <SidebarMenuItem key={note.name}>
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
