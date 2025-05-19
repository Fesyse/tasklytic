"use client"

import { NoteTitleInput } from "./note-title-input"

import { useEmojiData } from "@/hooks/use-emoji-data"
import { authClient } from "@/lib/auth-client"
import type { Note } from "@/lib/db-client"
import { updateNoteEmoji } from "@/lib/db-queries"
import { useLocalNote } from "@/lib/use-local-note"
import { getEmojiSlug } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { SmilePlus } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { NoteEmojiPicker } from "./note-emoji-picker"
import { Button } from "./ui/button"

export const NoteContentHeader = () => {
  const queryClient = useQueryClient()
  const { data: note } = useLocalNote()
  const { data: organization } = authClient.useActiveOrganization()

  const [emojiQueryTrigger, fireEmojiQuery] = useState(false)
  const { data: emojiData } = useEmojiData({
    enabled: emojiQueryTrigger
  })

  const setRandomEmoji = useCallback(async () => {
    if (!emojiQueryTrigger || !emojiData || !note || !organization) return

    const emoji = emojiData[Math.floor(Math.random() * emojiData.length)]!

    const newEmojiData = {
      emoji: emoji.emoji,
      emojiSlug: getEmojiSlug(emoji.label)
    }

    const { error } = await updateNoteEmoji({
      id: note.id,
      ...newEmojiData
    })

    void queryClient.setQueryData(
      ["note", note.id, organization.id],
      (old: Note) => {
        return {
          ...old,
          ...newEmojiData
        }
      }
    )

    if (error) {
      toast.error("Failed to set emoji")
      console.error(error)
    }
  }, [emojiQueryTrigger, emojiData, note?.id, organization?.id])

  useEffect(() => {
    if (!emojiQueryTrigger || !emojiData) return

    setRandomEmoji()
  }, [emojiQueryTrigger, emojiData, setRandomEmoji])

  return (
    <div className="group relative mx-auto mb-12 flex w-full max-w-[51rem] items-center gap-4 px-15 pt-40">
      <div className="text-muted-foreground absolute bottom-12 left-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {!note?.emoji ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={() => fireEmojiQuery(true)}
          >
            <SmilePlus />
            Add icon
          </Button>
        ) : null}
      </div>

      {note?.emoji ? <NoteEmojiPicker /> : null}
      <NoteTitleInput />
    </div>
  )
}
