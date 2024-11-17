import { NoteTitle } from "@/components/providers/note/title"
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

  const notePromise = api.notes.getById({ id: noteId })
  const blocksPromise = api.blocks.getAll({ noteId })

  const [note, blocks] = await Promise.all([notePromise, blocksPromise])

  if (!note) return redirect("/not-found")

  return (
    <div className="mx-auto w-full max-w-[900px] py-28 font-comfortaa">
      <NoteTitle note={note} />
    </div>
  )
}
