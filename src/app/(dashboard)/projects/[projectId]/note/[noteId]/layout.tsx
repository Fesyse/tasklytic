import { NoteLayout } from "./note-layout"
import { api } from "@/trpc/server"

type LayoutProps = React.PropsWithChildren<{
  params: Promise<{
    id: string
    noteId: string
  }>
}>

export default async function Layout({ params, children }: LayoutProps) {
  const { noteId } = await params
  const blocks = (await api.blocks.getAll({ noteId })).sort(
    (a, b) => a.order - b.order
  )

  return <NoteLayout blocks={blocks}>{children}</NoteLayout>
}
