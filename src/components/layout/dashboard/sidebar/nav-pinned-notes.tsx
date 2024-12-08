"use client"

import { ArrowUpRight, Link, Pin, StarOff, Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/lib/menu-list"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"

export function NavPinnedNotes({
  pinnedNotes
}: {
  pinnedNotes: SidebarNav["pinnedNotes"]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="flex items-center gap-1.5">
        <Pin className="-rotate-45" size={14} /> Pinned notes
      </SidebarGroupLabel>
      <SidebarMenu>
        {!pinnedNotes.isLoading && pinnedNotes.items?.length ? (
          pinnedNotes.items.map(note => (
            <SidebarMenuItem key={note.name}>
              <SidebarMenuButton
                asChild
                isActive={note.isActive}
                title={note.name}
              >
                <Link href={note.href}>
                  <span>
                    <note.emoji />
                  </span>
                  <span>{note.name ?? "Untitled"}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <DotsHorizontalIcon />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <StarOff className="text-muted-foreground" />
                    <span>Remove from pinned notes</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link className="text-muted-foreground" />
                    <span>Copy Link</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ArrowUpRight className="text-muted-foreground" />
                    <span>Open in New Tab</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash2 className="text-muted-foreground" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
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
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <DotsHorizontalIcon />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
