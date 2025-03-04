import { NoteWithContent } from "@/server/db/schema"

type NoteEditorProps = {
  note: NoteWithContent
}

export const useNoteEditor = ({ note }: NoteEditorProps) => {
  // const editor = useEditor

  const handleChange = async (value: any) => {
    console.log(value)
  }

  return {
    editor: null,
    handleChange
  }
}
