import {
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch
} from "./ui/emoji-picker"

import { EmojiPicker } from "./ui/emoji-picker"

import { dexieDB, type Note } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import { PopoverContent } from "@radix-ui/react-popover"
import { FileIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Popover, PopoverTrigger } from "./ui/popover"

export function NoteEmojiPicker({ note }: { note: Note }) {
  const [emoji, setEmoji] = useState(note.emoji)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const updateEmoji = useCallback(
    async (newEmoji: string) => {
      const { error } = await tryCatch(
        dexieDB.notes.update(note.id, { emoji: newEmoji })
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

  const handleEmojiSelect = async ({ emoji: newEmoji }: { emoji: string }) => {
    const success = await updateEmoji(newEmoji)
    if (success) {
      setIsPickerOpen(false)
    }
  }

  // Update document title when emoji or title changes
  useEffect(() => {
    const titlePrefix = emoji ? `${emoji} ` : ""
    document.title = titlePrefix + (note.title || "Untitled")
  }, [emoji, note.title])

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
                {emoji ? (
                  <span className="text-5xl">{emoji}</span>
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
                defaultValue={emoji}
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
