"use client"

import { Pin } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/lib/menu-list"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { NoteActions } from "./note-actions"

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
              <NoteActions note={note} />
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
