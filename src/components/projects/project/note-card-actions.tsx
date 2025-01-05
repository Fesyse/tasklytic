"use client"

import { MoreVertical } from "lucide-react"
import React from "react"
import { NoteActions } from "@/components/layout/dashboard/sidebar/note-actions"
import { type Note } from "@/server/db/schema"

type NoteCardActionsProps = {
  note: Note
}

export const NoteCardActions: React.FC<NoteCardActionsProps> = ({ note }) => {
  return (
    <NoteActions
      note={{
        id: note.id,
        href: `/projects/${note.projectId}/note/${note.id}`,
        isActive: false,
        name: note.title,
        emoji: () => <span className="text-xl">{note.emoji}</span>,
        isPinned: note.isPinned,
        private: note.private
      }}
      small
      icon={
        <div className="p-1 rounded transition-colors hover:bg-muted/75">
          <MoreVertical className="text-muted-foreground" size={16} />
        </div>
      }
    />
  )
}
