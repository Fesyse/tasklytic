"use client"

import { Plate } from "@udecode/plate-common/react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { NoteLayout as NoteLayoutContent } from "@/components/layout/dashboard/note-layout"
import { useNoteEditor } from "@/hooks/use-note-editor"
import { PusherProvider, useNoteSlug } from "@/lib/pusher"
import type { Block, Note } from "@/server/db/schema"

type NoteLayoutProps = React.PropsWithChildren<{
  note: Note
  blocks: Block[]
}>

export function NoteLayout({ blocks, note, children }: NoteLayoutProps) {
  const { editor, handleChange } = useNoteEditor({ blocks })
  const slug = useNoteSlug()

  return (
    <PusherProvider slug={slug}>
      <DndProvider backend={HTML5Backend}>
        <Plate editor={editor} onValueChange={handleChange}>
          <NoteLayoutContent note={note}>{children}</NoteLayoutContent>
        </Plate>
      </DndProvider>
    </PusherProvider>
  )
}
