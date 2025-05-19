"use client"

import { NoteEditorProvider } from "@/contexts/note-editor-context"
import { useNoteEditor } from "@/hooks/use-note-editor"
import { authClient } from "@/lib/auth-client"
import { Plate } from "@udecode/plate/react"
import { useEffect, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { discussionPlugin } from "./editor/plugins/discussion-plugin"
import { SettingsDialog, SettingsProvider } from "./editor/settings"
import { NoteHeader } from "./layouts/dashboard/note-page/note-header"
import { NoteEmojiPicker } from "./note-emoji-picker"
import { NoteTitleInput } from "./note-title-input"
import { Editor, EditorContainer } from "./ui/editor"
import { Skeleton } from "./ui/skeleton"

export const NoteEditor = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  const { editor, isLoading, note } = useNoteEditor({
    setIsSaving,
    setIsAutoSaving
  })
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
    <NoteEditorProvider
      value={{ isSaving, isAutoSaving, setIsSaving, setIsAutoSaving }}
    >
      <NoteHeader />
      <div className="mt-44">
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
              <div className="mx-auto mb-12 flex w-full max-w-[50rem] items-center gap-4 px-14">
                <NoteEmojiPicker note={note} />
                <NoteTitleInput note={note} />
              </div>
              <DndProvider backend={HTML5Backend}>
                {editor && !isLoading && (
                  <Plate editor={editor}>
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
      </div>
    </NoteEditorProvider>
  )
}
