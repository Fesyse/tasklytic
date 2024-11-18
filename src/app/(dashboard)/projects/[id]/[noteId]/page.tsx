import { Note } from "@/components/projects/project/note"
import { NoteTitle } from "@/components/projects/project/note/title"
import { api } from "@/trpc/server"
import { redirect } from "next/navigation"

type NotePageProps = {
  params: Promise<{
    id: string
    noteId: string
  }>
}

export default async function NotePage({ params }: NotePageProps) {
  const { id: projectId, noteId } = await params

  const [note, blocks] = await Promise.all([
    api.notes.getById({ id: noteId }),
    api.blocks.getAll({ noteId })
  ])

  if (!note) return redirect("/not-found")

  return (
    <div className="mx-auto w-full max-w-[900px] py-28 font-comfortaa">
      <NoteTitle note={note} />
      <Note className="mt-4" blocks={blocks} />
    </div>
  )
}
