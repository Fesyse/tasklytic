"use client"

import { NoteEmojiPicker } from "./note-emoji-picker"
import { NoteTitleInput } from "./note-title-input"
import { Button } from "./ui/button"

import { useEmojiData } from "@/hooks/use-emoji-data"
import { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import { authClient } from "@/lib/auth-client"
import type { Note } from "@/lib/db-client"
import { getEmojiSlug } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { SmilePlus } from "lucide-react"
import { useParams } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"

export const NoteContentHeader = () => {
  const queryClient = useQueryClient()
  const { noteId } = useParams<{ noteId: string }>()
  const { note, updateNoteEmoji } = useSyncedNoteQueries(noteId as string)
  const { data: organization } = authClient.useActiveOrganization()
  const [isAddingEmoji, setIsAddingEmoji] = useState(false)

  const handleAddRandomEmoji = useCallback(async () => {
    setIsAddingEmoji(true)
  }, [])

  const { data: emojiData } = useEmojiData({
    enabled: isAddingEmoji
  })

  // Effect logic moved into a callback that runs when emoji data is available
  if (isAddingEmoji && emojiData && note && organization) {
    setIsAddingEmoji(false)

    const emoji = emojiData[Math.floor(Math.random() * emojiData.length)]!
    const emojiSlug = getEmojiSlug(emoji.label)

    // Use the updateNoteEmoji from useSyncedNoteQueries hook
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

        toast.success("Emoji added")
      })
      .catch((error) => {
        toast.error("Failed to set emoji")
        console.error(error)
      })
  }

  return (
    <div className="group relative mx-auto mb-12 flex w-full max-w-[51rem] items-center gap-4 px-15 pt-40">
      <div className="text-muted-foreground absolute bottom-12 left-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <EmojiButton
          hasEmoji={!!note?.emoji}
          onAddEmoji={handleAddRandomEmoji}
        />
      </div>
      {note?.emoji ? <NoteEmojiPicker /> : null}
      <NoteTitleInput />
    </div>
  )
}

// Extracted into a separate component for better readability
type EmojiButtonProps = {
  hasEmoji: boolean
  onAddEmoji: () => void
}

const EmojiButton = ({ hasEmoji, onAddEmoji }: EmojiButtonProps) => {
  if (hasEmoji) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-xl"
      onClick={onAddEmoji}
    >
      <SmilePlus />
      Add icon
    </Button>
  )
}
