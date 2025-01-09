"use client"

import { Pin } from "lucide-react"
import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import { TextMorph } from "@/components/ui/text-morph"
import { NoteActions } from "./note-actions"
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
            <SidebarMenuItem key={note.name}>
              <SidebarMenuButton
                asChild
                isActive={note.isActive}
                title={note.name}
              >
                <Link href={note.href} prefetch>
                  <span>
                    <note.emoji />
                  </span>
                  <TextMorph>{note.name ?? "Untitled"}</TextMorph>
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
      </SidebarMenu>
    </SidebarGroup>
  )
}
