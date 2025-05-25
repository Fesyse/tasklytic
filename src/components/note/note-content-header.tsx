"use client"

import { NoteTitleInput } from "@/components/note-title-input"
import { NoteEmojiPicker } from "@/components/note/note-emoji-picker"
import { Button } from "@/components/ui/button"

import { useEmojiData } from "@/hooks/use-emoji-data"
import { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import { authClient } from "@/lib/auth-client"
import type { Note } from "@/lib/db-client"
import { cn, getEmojiSlug } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { SmilePlus, Star } from "lucide-react"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export const NoteContentHeader = () => {
  const queryClient = useQueryClient()
  const { noteId } = useParams<{ noteId: string }>()
  const { note, updateNoteEmoji, updateNoteFavorite } =
    useSyncedNoteQueries(noteId)
  const { data: organization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()
  const [isAddingEmoji, setIsAddingEmoji] = useState(false)

  const handleAddRandomEmoji = useCallback(async () => {
    setIsAddingEmoji(true)
  }, [])

  const { data: emojiData } = useEmojiData({
    enabled: isAddingEmoji
  })

  const handleToggleFavorite = useCallback(async () => {
    if (!note || !organization || !session) return

    const newFavoritedState = !note.isFavorited

    // Use the updateNoteFavorite from useSyncedNoteQueries hook
    updateNoteFavorite(
      newFavoritedState,
      newFavoritedState ? session.user.id : null
    )
      .then(({ error }) => {
        if (error) {
          toast.error("Failed to update favorite status")
          console.error(error)
          return
        }

        // Optimistically update the cache
        queryClient.setQueryData(
          ["note", note.id, organization.id],
          (old: Note) => ({
            ...old,
            isFavorited: newFavoritedState,
            favoritedByUserId: newFavoritedState ? session.user.id : null
          })
        )
      })
      .catch((error) => {
        toast.error("Failed to update favorite status")
        console.error(error)
      })
  }, [note, organization, session, updateNoteFavorite, queryClient])

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

        toast.success("Emoji added")
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

  return (
    <div className="group relative mx-auto mb-12 flex w-full max-w-[51rem] items-center gap-4 px-15 pt-40">
      <div
        className={cn(
          "text-muted-foreground absolute bottom-12 left-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          {
            "bottom-16": !!note?.emoji
          }
        )}
      >
        <div className="flex gap-2">
          <EmojiButton
            hasEmoji={!!note?.emoji}
            onAddEmoji={handleAddRandomEmoji}
          />
          <FavoriteButton
            isFavorited={!!note?.isFavorited}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
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
      <SmilePlus className="mr-1 size-4" />
      Add icon
    </Button>
  )
}

// Favorite button component
type FavoriteButtonProps = {
  isFavorited: boolean
  onToggleFavorite: () => void
}

const FavoriteButton = ({
  isFavorited,
  onToggleFavorite
}: FavoriteButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-xl"
      onClick={onToggleFavorite}
    >
      <Star
        className={`mr-1 size-4 ${isFavorited ? "fill-yellow-400 text-yellow-400" : ""}`}
      />
      {isFavorited ? "Remove from favorites" : "Add to favorites"}
    </Button>
  )
}
