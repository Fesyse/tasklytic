import { PlateStoreState } from "@udecode/plate-common/react"
import debounce from "lodash.debounce"
import { useParams } from "next/navigation"
import { useCallback } from "react"
import { useCreateEditor } from "@/components/editor/use-create-editor"
import { useNoteEditorState } from "@/components/providers/note-editor-state-provider"
import { ArgumentTypes } from "@/types/utils"
import { NoteWithContent } from "@/server/db/schema"
import { api } from "@/trpc/react"

type NoteEditorProps = {
  note: NoteWithContent
}

export const useNoteEditor = ({ note }: NoteEditorProps) => {
  const editor = useCreateEditor(note.content.content)
  const setNoteEditorState = useNoteEditorState(s => s.setState)

  const { mutate: updateContent } = api.notes.updateContent.useMutation({
    onSuccess: () => {
      setNoteEditorState({ saved: true })
    }
  })
  const { projectId } = useParams<{ projectId: string }>()

  type HandleChangeOptions = ArgumentTypes<
    NonNullable<PlateStoreState<typeof editor>["onChange"]>
  >[0]

  const saveToDb = useCallback(
    debounce(({ value }: HandleChangeOptions) => {
      updateContent({ contentId: note.content.id, projectId, content: value })
    }, 444),
    []
  )

  const handleChange = (options: HandleChangeOptions) => {
    setNoteEditorState({ saved: false })

    saveToDb(options)
  }

  return {
    editor,
    handleChange
  }
}
