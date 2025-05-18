import { useCreateEditor } from "@/components/editor/use-create-editor"
import { authClient } from "@/lib/auth-client"
import { dexieDB, type Note } from "@/lib/db-client"
import { getNoteWithBlocks } from "@/lib/db-queries"
import { tryCatch } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import type { Value } from "@udecode/plate"
import { notFound, useParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export function useNoteEditor() {
  const { noteId } = useParams<{ noteId: string }>()
  const { data: organization } = authClient.useActiveOrganization()

  const {
    data: note,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["note", noteId, organization?.id],
    queryFn: async () => {
      const { data, error } = await getNoteWithBlocks(noteId, organization!.id)
      if (error) throw error
      return data
    },
    enabled: !!organization?.id
  })

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!note) return

      if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        const value = editor.children

        saveNotesLocally({
          noteId,
          oldValue: note.blocks,
          newValue: value
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [noteId, note?.blocks, editor])

  useEffect(() => {
    if (noteId) localStorage.setItem("last-note-id", noteId)
  }, [noteId])

  if (isError) notFound()
  if (!note) return { editor, isLoading, note: undefined }

  const { blocks: _blocks, ...returnNote } = note
  return { editor, isLoading, note: returnNote as Note }
}

async function saveNotesLocally(data: {
  noteId: string
  oldValue: Value
  newValue: Value
}) {
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

  const { error } = await tryCatch(
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
  )

  if (error) {
    console.error(error)
    toast.error("Failed to save notes!")
  }
}
