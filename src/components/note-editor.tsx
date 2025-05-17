"use client"

import { useNoteEditor } from "@/hooks/use-note-editor"
import { Plate } from "@udecode/plate/react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { SettingsDialog, SettingsProvider } from "./editor/settings"
import { NoteTitleInput } from "./note-title-input"
import { Editor, EditorContainer } from "./ui/editor"
import { Skeleton } from "./ui/skeleton"

export const NoteEditor = () => {
  const { editor, isLoading, note } = useNoteEditor()

  return (
    <SettingsProvider>
      {isLoading || !note ? (
        <div className="space-y-4">
          {/* Title skeleton */}
          <Skeleton className="mx-auto h-12 w-3/4 max-w-[44rem]" />

          {/* Editor content skeleton */}
          <div className="mx-auto max-w-[44rem] space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-11/12" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-9/12" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        </div>
      ) : (
        <>
          <NoteTitleInput note={note} />
          <DndProvider backend={HTML5Backend}>
            {editor && !isLoading && (
              <Plate editor={editor}>
                <EditorContainer>
                  <Editor variant="demo" className="pt-0" />
                </EditorContainer>

                <SettingsDialog />
              </Plate>
            )}
          </DndProvider>
        </>
      )}
    </SettingsProvider>
  )
}
