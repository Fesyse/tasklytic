type NotePageProps = {
  params: Promise<{
    id: string
    noteId: string
  }>
}

export default async function NotePage({ params }: NotePageProps) {
  return <div></div>
}
