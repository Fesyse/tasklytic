import {
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch
} from "./ui/emoji-picker"

import { EmojiPicker } from "./ui/emoji-picker"

import { dexieDB, type Note } from "@/lib/db-client"
import { getEmojiSlug, getEmojiUrl, tryCatch } from "@/lib/utils"
import { PopoverContent } from "@radix-ui/react-popover"
import type { Emoji } from "frimousse"
import { FileIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Popover, PopoverTrigger } from "./ui/popover"

export function NoteEmojiPicker({ note }: { note: Note }) {
  const [emoji, setEmoji] = useState<Emoji>({
    emoji: note.emoji ?? "",
    label: note.emoji ?? ""
  })

  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const updateEmoji = useCallback(
    async (newEmoji: Emoji) => {
      const { error } = await tryCatch(
        dexieDB.notes.update(note.id, {
          emoji: newEmoji.emoji,
          emojiSlug: getEmojiSlug(newEmoji.label)
        })
      )

      if (error) {
        toast.error(error.message)
        return false
      }

      setEmoji(newEmoji)
      return true
    },
    [note.id]
  )

  const handleEmojiSelect = async (emoji: Emoji) => {
    const success = await updateEmoji(emoji)
    if (success) {
      setIsPickerOpen(false)
    }
  }

  // Update document link[rel~='icon'] when emoji changes
  useEffect(() => {
    if (!emoji.label.length) return

    const emojiUrl = getEmojiUrl(emoji.label)

    let link = document.querySelector(
      "link[rel~='icon'][data-emoji='true']"
    ) as HTMLLinkElement
    if (link) {
      link.href = emojiUrl
    } else {
      link = document.createElement("link")
      link.rel = "icon"
      link.href = emojiUrl
      link.setAttribute("data-emoji", "true")
      document.head.appendChild(link)
    }
  }, [emoji.label])

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex size-[48px] cursor-pointer items-center justify-center"
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                aria-label="Select emoji"
              >
                {emoji.emoji.length > 0 ? (
                  <span className="text-5xl">{emoji.emoji}</span>
                ) : (
                  <FileIcon className="text-muted-foreground size-[48px]" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="z-10 w-[256px] p-0"
              align="end"
              sideOffset={5}
            >
              <EmojiPicker
                className="h-[300px] w-[256px]"
                defaultValue={emoji.emoji}
                onEmojiSelect={handleEmojiSelect}
              >
                <EmojiPickerSearch />
                <EmojiPickerContent />
                <EmojiPickerFooter />
              </EmojiPicker>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
