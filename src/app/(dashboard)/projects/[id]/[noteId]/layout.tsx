import { api } from "@/trpc/server"
import { NoteLayout } from "./note-layout"

type LayoutProps = React.PropsWithChildren<{
  params: Promise<{
    id: string
    noteId: string
  }>
}>

export default async function Layout({ params, children }: LayoutProps) {
  const { noteId } = await params
  const blocks = await api.blocks.getAll({ noteId })

  return <NoteLayout blocks={blocks}>{children}</NoteLayout>
}
