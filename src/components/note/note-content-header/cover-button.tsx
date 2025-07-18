import { Button } from "@/components/ui/button"
import { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import type { Note } from "@/lib/db-client"
import { Image, ImageOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

type NoteCoverButtonProps = {
  note: Note | undefined
}

export const NoteCoverButton: React.FC<NoteCoverButtonProps> = ({ note }) => {
  const t = useTranslations("Dashboard.Note.Editor.ContentHeader")
  const { noteId } = useParams<{ noteId: string }>()
  const { updateNoteCover } = useSyncedNoteQueries(noteId)

  const handleToggleCover = () => {
    if (note?.cover) updateNoteCover(undefined)
    // TODO: make that random image from upslash
    else updateNoteCover(`/note-images/solid_red.png`)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-xl"
      onClick={handleToggleCover}
    >
      {!note?.cover ? (
        <Image className="mr-1 size-4" />
      ) : (
        <ImageOff className="mr-1 size-4" />
      )}
      {t("toggleCover", { hasCover: note?.cover ? "true" : "false" })}
    </Button>
  )
}
