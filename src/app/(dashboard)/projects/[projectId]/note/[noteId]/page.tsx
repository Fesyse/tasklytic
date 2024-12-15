import { Note } from "@/components/projects/project/note"
import { NoteEmojiPicker } from "@/components/projects/project/note/emoji-picker"
import { NoteTitle } from "@/components/projects/project/note/title"

type NotePageProps = {
  params: Promise<{
    id: string
    noteId: string
  }>
}

export default async function NotePage(props: NotePageProps) {
  const { noteId } = await props.params
  return (
    <div className="mx-auto w-full max-w-[900px] py-28 font-comfortaa">
      <div className="flex items-center gap-4">
        <NoteEmojiPicker noteId={noteId} />
        <NoteTitle noteId={noteId} />
      </div>
      <Note />
    </div>
  )
}
