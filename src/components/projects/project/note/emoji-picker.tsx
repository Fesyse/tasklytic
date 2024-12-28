"use client"

import { Emoji } from "@udecode/plate-emoji"
import { SmilePlus, SquarePen } from "lucide-react"
import dynamic from "next/dynamic"
import { Suspense, useCallback, useEffect, useState, type FC } from "react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { usePrevious } from "@/hooks/use-previous"
import { api } from "@/trpc/react"

type NoteEmojiPickerProps = { noteId: string }

const EmojiDropdownMenu = dynamic(
  () =>
    import("@/components/plate-ui/emoji-dropdown-menu").then(
      mod => mod.EmojiDropdownMenu
    ),
  {
    ssr: false
  }
)

export const NoteEmojiPicker: FC<NoteEmojiPickerProps> = ({ noteId }) => {
  const utils = api.useUtils()
  const [emoji, setEmoji] = useState("")
  const prevEmoji = usePrevious(emoji)

  const { data: note, isLoading } = api.notes.getById.useQuery({ id: noteId })
  const { mutate: update } = api.notes.update.useMutation({
    onError: () => {
      setEmoji(prevEmoji)
      toast.error("Failed to update emoji!")
    }
  })

  const handleSelectEmoji = useCallback((emoji: Emoji) => {
    const nativeEmoji = emoji.skins[0]?.native!

    setEmoji(nativeEmoji)
    utils.notes.getById.invalidate({ id: noteId })
    update({
      id: noteId,
      emoji: nativeEmoji
    })
  }, [])

  useEffect(() => {
    if (note?.emoji) setEmoji(note.emoji)
  }, [note])

  return isLoading || !note ? (
    <Skeleton className="h-10 w-10" />
  ) : (
    <Suspense fallback={<Skeleton className="h-10 w-10" />}>
      <EmojiDropdownMenu
        onSelectEmoji={handleSelectEmoji}
        isWithEditor={false}
        icon={
          !!note.emoji || !!emoji ? (
            <span className="group relative cursor-pointer select-none text-5xl">
              {note.emoji ?? emoji}
              <SquarePen
                className="absolute bottom-[calc(100%-0.3rem)] left-[calc(100%-0.3rem)] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                size={12}
              />
            </span>
          ) : (
            <SmilePlus size={48} color="hsl(var(--muted-foreground))" />
          )
        }
      />
    </Suspense>
  )
}
