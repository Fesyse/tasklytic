import { Note } from "@/components/projects/project/note"
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
      <NoteTitle noteId={noteId} />
      <Note className="mt-4" />
    </div>
  )
}
