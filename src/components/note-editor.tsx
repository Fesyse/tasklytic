"use client"

import { useNoteEditor } from "@/hooks/use-note-editor"
import { Plate } from "@udecode/plate/react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { SettingsDialog, SettingsProvider } from "./editor/settings"
import { Editor, EditorContainer } from "./ui/editor"

export const NoteEditor = () => {
  const editor = useNoteEditor()

  return (
    <SettingsProvider>
      <input
        placeholder="New page"
        className="mx-auto mb-12 block w-full max-w-[44rem] border-none !bg-transparent p-0 font-sans !text-4xl font-bold outline-none"
      />
      <DndProvider backend={HTML5Backend}>
        {editor && (
          <Plate editor={editor}>
            <EditorContainer>
              <Editor variant="demo" className="pt-0" />
            </EditorContainer>

            <SettingsDialog />
          </Plate>
        )}
      </DndProvider>
    </SettingsProvider>
  )
}
