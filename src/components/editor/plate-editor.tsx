"use client"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import { Plate } from "@udecode/plate/react"

import { SettingsDialog } from "@/components/editor/settings"
import { useCreateEditor } from "@/components/editor/use-create-editor"
import { Editor, EditorContainer } from "@/components/ui/editor"
import { useParams } from "next/navigation"

export function PlateEditor() {
  const { noteId } = useParams<{ noteId: string }>()

  const editor = useCreateEditor()

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>

        <SettingsDialog />
      </Plate>
    </DndProvider>
  )
}
