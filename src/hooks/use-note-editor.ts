import { useCreateEditor } from "@/components/editor/use-create-editor"
import { useNoteEditorContext } from "@/contexts/note-editor-context"
import { authClient } from "@/lib/auth-client"
import { dexieDB } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import type { Value } from "@udecode/plate"
import type { User } from "better-auth"
import { notFound, useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useNote } from "./use-note"

export function useNoteEditor() {
  const { isChanged, setIsChanged, setIsSaving, setIsAutoSaving } =
    useNoteEditorContext()
  const { noteId } = useParams<{ noteId: string }>()
  const queryClient = useQueryClient()

  const { data: session } = authClient.useSession()
  const { data: organization } = authClient.useActiveOrganization()
  const { data: note, isLoading, isError } = useNote()

  const editor = useCreateEditor({
    skipInitialization: true
  })

  const [previousEditorValue, setPreviousEditorValue] = useState<
    Value | undefined
  >()

  useEffect(() => {
    if (note?.blocks && editor) {
      const sortedBlocks = [...note.blocks].sort(
        (a, b) => (a.order as number) - (b.order as number)
      )

      editor.tf.init({
        value: sortedBlocks,
        autoSelect: "end"
      })
      setPreviousEditorValue(sortedBlocks)
    }
  }, [note?.blocks, editor.tf.init])

  const saveNote = useCallback(
    async (isAutoSave = false) => {
      if (!note || !editor) return

      const value = editor.children

      try {
        if (!session || !previousEditorValue) return

        if (isAutoSave) {
          setIsAutoSaving(true)
        } else {
          setIsSaving(true)
        }

        const sortedPreviousEditorValue = [...previousEditorValue]
          .sort((a, b) => (a.order as number) - (b.order as number))
          .map((block, index) => ({
            ...block,
            order: index
          }))
        const sortedValue = [...value]
          .sort((a, b) => (a.order as number) - (b.order as number))
          .map((block, index) => ({
            ...block,
            order: index
          }))

        await saveNotesLocally({
          user: session.user,
          noteId,
          oldValue: sortedPreviousEditorValue,
          newValue: sortedValue
        })

        setPreviousEditorValue(sortedValue)

        // Update React Query cache
        if (organization?.id) {
          // Optimistically update the cache
          queryClient.setQueryData(["note", noteId, organization.id], {
            ...note,
            blocks: sortedValue,
            updatedAt: new Date(),
            updatedByUserId: session.user.id,
            updatedByUserName: session.user.name
          })
        }

        if (isAutoSave) {
          setIsAutoSaving(false)
        } else {
          setIsSaving(false)
        }

        setIsChanged(false)
      } catch (error) {
        setIsChanged(true)
        console.error("Failed to save note:", error)
      }
    },
    [
      noteId,
      note,
      editor,
      previousEditorValue,
      session,
      organization?.id,
      queryClient
    ]
  )

  // Add auto-save functionality
  useEffect(() => {
    if (!isChanged || isLoading) return

    const autoSaveTimeout = setTimeout(() => {
      saveNote(true)
    }, 3000) // Auto-save after 3 seconds of changes

    return () => clearTimeout(autoSaveTimeout)
  }, [isChanged, isLoading, saveNote])

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
  }, [note, saveNote])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isChanged) {
        e.preventDefault()
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?"
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isChanged])

  if (isError) notFound()
  if (!note)
    return {
      editor,
      isLoading,
      note: undefined,
      saveNote
    }

  return {
    editor,
    isLoading,
    note,
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
    return JSON.stringify(oldBlock) !== JSON.stringify(block)
  })

  const [{ error: blocksError }, { error: noteError }] = await Promise.all([
    tryCatch(
      dexieDB.transaction("rw", dexieDB.blocks, () => {
        dexieDB.blocks.bulkAdd(
          createdBlocks.map((block) => ({
            id: block.id as string,
            noteId: data.noteId,
            content: block,
            order: block.order as number
          }))
        )

        dexieDB.blocks.bulkUpdate(
          updatedBlocks.map((block) => ({
            key: block.id as string,
            changes: {
              content: block,
              order: block.order as number
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
