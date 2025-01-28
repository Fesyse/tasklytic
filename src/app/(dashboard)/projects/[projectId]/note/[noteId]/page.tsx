import { type Metadata } from "next"
import { redirect } from "next/navigation"
import { Note } from "@/components/projects/project/note"
import { NoteEmojiPicker } from "@/components/projects/project/note/emoji-picker"
import { NoteTitle } from "@/components/projects/project/note/title"
import { NoteLayout } from "./note-layout"
import { api } from "@/trpc/server"

type NotePageProps = {
  params: Promise<{
    projectId: string
    noteId: string
  }>
}

export async function generateMetadata({
  params
}: NotePageProps): Promise<Metadata> {
  const { noteId, projectId } = await params
  const note = await api.notes.getById({ id: noteId, projectId })

  return {
    title: (note?.emoji ? note.emoji + " " : "") + (note?.title ?? "Untitled")
  }
}

export default async function NotePage(props: NotePageProps) {
  const { noteId, projectId } = await props.params

  const [note, blocks] = await Promise.all([
    api.notes.getById({ id: noteId, projectId }),
    api.blocks
      .getAll({ noteId })
      .then(blocks => blocks.toSorted((a, b) => a.order - b.order))
  ])

  if (!note) redirect("/not_found")

  return (
    <NoteLayout blocks={blocks} note={note}>
      <div className="mx-auto w-full max-w-[900px] py-28 font-comfortaa">
        <div className="flex items-center gap-4 px-4">
          <NoteEmojiPicker note={note} />
          <NoteTitle note={note} />
        </div>
        <Note />
      </div>
    </NoteLayout>
  )
}
