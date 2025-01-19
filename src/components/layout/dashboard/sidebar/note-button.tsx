import Link from "next/link"
import React from "react"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { TextMorph } from "@/components/ui/text-morph"
import { NoteActions } from "./note-actions"
import { type SidebarNote } from "@/lib/sidebar"

type NoteButtonProps = {
  note: SidebarNote
}

export const NoteButton: React.FC<NoteButtonProps> = ({ note }) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={note.isActive} title={note.name} asChild>
        <Link href={note.href} prefetch>
          <span>{note.emoji}</span>
          <TextMorph>{note.name ?? "Untitled"}</TextMorph>
        </Link>
      </SidebarMenuButton>
      <NoteActions note={note} />
    </SidebarMenuItem>
  )
}
