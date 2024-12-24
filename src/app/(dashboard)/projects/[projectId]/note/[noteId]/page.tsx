import { type Metadata } from "next"
import { Note } from "@/components/projects/project/note"
import { NoteEmojiPicker } from "@/components/projects/project/note/emoji-picker"
import { NoteTitle } from "@/components/projects/project/note/title"
import { api } from "@/trpc/server"

type NotePageProps = {
  params: Promise<{
    id: string
    noteId: string
  }>
}

export async function generateMetadata({
  params
}: NotePageProps): Promise<Metadata> {
  const { noteId } = await params
  const note = await api.notes.getById({ id: noteId })

  return {
    title: (note?.emoji ? note.emoji + " " : "") + (note?.title ?? "Untitled")
  }
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
