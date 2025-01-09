import { type Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Note } from "@/components/projects/project/note"
import { NoteInfo } from "@/components/projects/project/note/note-info"
import { sleep } from "@/lib/utils"
import { NoteLayout } from "./note-layout"
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

  const [note, blocks] = await Promise.all([
    api.notes.getById({ id: noteId }),
    api.blocks
      .getAll({ noteId })
      .then(blocks => blocks.toSorted((a, b) => a.order - b.order))
  ])

  await sleep(10000)

  if (!note) redirect("/not_found")

  return (
    <NoteLayout blocks={blocks} note={note}>
      <div className="mx-auto w-full max-w-[900px] py-28 font-comfortaa">
        <div className="flex items-center gap-4 px-4">
          <Suspense
            fallback={
              <>
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-44" />
              </>
            }
          >
            <NoteInfo noteId={noteId} />
          </Suspense>
        </div>
        <Note />
      </div>
    </NoteLayout>
  )
}
