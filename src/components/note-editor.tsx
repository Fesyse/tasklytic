"use client"

import {
  NoteEditorContext,
  useNoteEditorContext
} from "@/contexts/note-editor-context"
import { useNoteEditor } from "@/hooks/use-note-editor"
import { authClient } from "@/lib/auth-client"
import { Plate } from "@udecode/plate/react"
import { useEffect, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { discussionPlugin } from "./editor/plugins/discussion-plugin"
import { SettingsDialog, SettingsProvider } from "./editor/settings"
import { NoteHeader } from "./layouts/dashboard/note-page/note-header"
import { NoteContentHeader } from "./note-content-header"
import { Editor, EditorContainer } from "./ui/editor"
import { Skeleton } from "./ui/skeleton"

export const NoteEditor = () => {
  const { setIsChanged } = useNoteEditorContext()

  const { editor, isLoading, note } = useNoteEditor()
  const session = authClient.useSession()
  const userId = session.data?.user.id || ""

  // Set the noteId and currentUserId in the discussion plugin when the note is loaded
  useEffect(() => {
    if (editor && note?.id) {
      editor.setOption(discussionPlugin, "noteId", note.id)
      editor.setOption(discussionPlugin, "currentUserId", userId)
    }
  }, [editor, note?.id, userId])

  return (
    <>
      <NoteHeader />
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
            <NoteContentHeader />
            <DndProvider backend={HTML5Backend}>
              {editor && !isLoading && (
                <Plate
                  editor={editor}
                  onChange={({ value }) => {
                    if (!note?.blocks) return

                    const hasChanges =
                      JSON.stringify(value) !== JSON.stringify(note.blocks)

                    setIsChanged(hasChanges)
                  }}
                >
                  <EditorContainer>
                    <Editor
                      variant="demo"
                      className="pt-0"
                      placeholder="Start typing your note here..."
                    />
                  </EditorContainer>

                  <SettingsDialog />
                </Plate>
              )}
            </DndProvider>
          </>
        )}
      </SettingsProvider>
    </>
  )
}

export const NoteEditorProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [isChanged, setIsChanged] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  return (
    <NoteEditorContext.Provider
      value={{
        isChanged,
        setIsChanged,
        isSaving,
        setIsSaving,
        isAutoSaving,
        setIsAutoSaving
      }}
    >
      {children}
    </NoteEditorContext.Provider>
  )
}
