import { useCreateEditor } from "@/components/editor/use-create-editor"
import { authClient } from "@/lib/auth-client"
import { dexieDB, type Note } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import type { Value } from "@udecode/plate"
import type { User } from "better-auth"
import { notFound, useParams } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useNote } from "./use-note"

type UseNoteEditorProps = {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  setIsAutoSaving: React.Dispatch<React.SetStateAction<boolean>>
}

export function useNoteEditor({
  setIsSaving,
  setIsAutoSaving
}: UseNoteEditorProps) {
  const { noteId } = useParams<{ noteId: string }>()
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { data: session } = authClient.useSession()
  const { data: note, isLoading, isError } = useNote()

  const editor = useCreateEditor({
    skipInitialization: true
  })

  useEffect(() => {
    if (note?.blocks && editor) {
      editor.tf.init({
        value: note.blocks,
        autoSelect: "end"
      })
    }
  }, [note?.blocks, editor])

  // Clean up auto-save timer when component unmounts
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  const saveNote = useCallback(async () => {
    if (!note || !editor) return

    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }

    const value = editor.children

    try {
      if (!session) return
      setIsSaving(true)

      await saveNotesLocally({
        user: session.user,
        noteId,
        oldValue: note.blocks,
        newValue: value
      })
      setIsSaving(false)

      toast.success("Note saved successfully!")
    } catch (error) {
      console.error("Failed to save note:", error)
    }
  }, [noteId, note, editor])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!note) return

      if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        saveNote()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [noteId, note, editor, saveNote])

  if (isError) notFound()
  if (!note)
    return {
      editor,
      isLoading,
      note: undefined,
      saveNote
    }

  const { blocks: _blocks, ...returnNote } = note
  return {
    editor,
    isLoading,
    note: returnNote as Note,
    saveNote
  }
}

async function saveNotesLocally(data: {
  user: User
  noteId: string
  oldValue: Value
  newValue: Value
}): Promise<void> {
  const createdBlocks = data.newValue.filter((block) => {
    const oldBlock = data.oldValue.find((b) => b.id === block.id)
    return !oldBlock
  })

  const deletedBlocks = data.oldValue.filter((block) => {
    const newBlock = data.newValue.find((b) => b.id === block.id)
    return !newBlock
  })

  const updatedBlocks = data.newValue.filter((block) => {
    const oldBlock = data.oldValue.find((b) => b.id === block.id)
    return oldBlock && oldBlock.content !== block.content
  })

  const [{ error: blocksError }, { error: noteError }] = await Promise.all([
    tryCatch(
      dexieDB.transaction("rw", dexieDB.blocks, () => {
        dexieDB.blocks.bulkAdd(
          createdBlocks.map((block) => ({
            id: block.id as string,
            noteId: data.noteId,
            content: block
          }))
        )

        dexieDB.blocks.bulkUpdate(
          updatedBlocks.map((block) => ({
            key: block.id as string,
            changes: {
              content: block
            }
          }))
        )

        dexieDB.blocks.bulkDelete(
          deletedBlocks.map((block) => block.id as string)
        )
      })
    ),
    tryCatch(
      dexieDB.notes.update(data.noteId, {
        updatedByUserId: data.user.id,
        updatedByUserName: data.user.name,
        updatedAt: new Date()
      })
    )
  ])

  if (blocksError || noteError) {
    console.error(blocksError ?? noteError)
    toast.error("Failed to save notes!")
    throw blocksError ?? noteError
  }
}
