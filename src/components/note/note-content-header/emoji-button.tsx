import { Button } from "@/components/ui/button"
import { useEmojiData } from "@/hooks/use-emoji-data"
import type { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import { authClient } from "@/lib/auth-client"
import type { Note } from "@/lib/db-client"
import { getEmojiSlug } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { SmilePlus } from "lucide-react"
import { useCallback, useEffect } from "react"
import { toast } from "sonner"

type EmojiButtonProps = {
  note: Note | undefined
  updateNoteEmoji: ReturnType<typeof useSyncedNoteQueries>["updateNoteEmoji"]
  isAddingEmoji: boolean
  setIsAddingEmoji: React.Dispatch<React.SetStateAction<boolean>>
}

export const NoteEmojiButton = ({
  note,
  updateNoteEmoji,
  isAddingEmoji,
  setIsAddingEmoji
}: EmojiButtonProps) => {
  const { data: organization } = authClient.useActiveOrganization()
  const queryClient = useQueryClient()

  const handleAddRandomEmoji = useCallback(async () => {
    setIsAddingEmoji(true)
  }, [])

  const { data: emojiData } = useEmojiData({
    enabled: isAddingEmoji
  })

  // Effect logic moved into a callback that runs when emoji data is available
  useEffect(() => {
    if (!(isAddingEmoji && emojiData && note && organization)) return

    setIsAddingEmoji(false)
    const emoji = emojiData[Math.floor(Math.random() * emojiData.length)]!
    const emojiSlug = getEmojiSlug(emoji.label)

    updateNoteEmoji(emoji.emoji, emojiSlug)
      .then(({ error }) => {
        if (error) {
          toast.error("Failed to set emoji")
          console.error(error)
          return
        }

        // Optimistically update the cache
        queryClient.setQueryData(
          ["note", note.id, organization.id],
          (old: Note) => ({
            ...old,
            emoji: emoji.emoji,
            emojiSlug: emojiSlug
          })
        )
      })
      .catch((error) => {
        toast.error("Failed to set emoji")
        console.error(error)
      })
    // dependencies capture every variable referenced inside the effect
  }, [
    isAddingEmoji,
    emojiData,
    note,
    organization,
    updateNoteEmoji,
    queryClient
  ])

  if (note?.emoji) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-xl"
      onClick={handleAddRandomEmoji}
    >
      <SmilePlus className="mr-1 size-4" />
      Add icon
    </Button>
  )
}
