"use client"

import { discussionPlugin } from "@/components/editor/plugins/discussion-plugin"
import { SettingsDialog, SettingsProvider } from "@/components/editor/settings"
import { NoteHeader } from "@/components/layouts/dashboard/note-page/note-header"
import { NoteContentHeader } from "@/components/note/note-content-header"
import { NoteSkeleton } from "@/components/note/note-skeleton"
import { Editor, EditorContainer } from "@/components/ui/editor"
import {
  NoteEditorContext,
  useNoteEditorContext
} from "@/contexts/note-editor-context"
import { useNoteEditorV2 } from "@/hooks/use-note-editor-v2"
import { authClient } from "@/lib/auth-client"
import { Plate } from "@udecode/plate/react"
import { useEffect, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export const NoteEditor = () => {
  const { setIsChanged } = useNoteEditorContext()

  const { editor, isLoading, note } = useNoteEditorV2()
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
          <NoteSkeleton />
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
