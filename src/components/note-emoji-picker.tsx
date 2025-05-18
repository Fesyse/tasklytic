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
import { useState } from "react"
import { toast } from "sonner"
import { Popover, PopoverTrigger } from "./ui/popover"

export function NoteEmojiPicker({ note }: { note: Note }) {
  const [emoji, setEmoji] = useState(note.emoji)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const handleEmojiSelect = async ({ emoji }: { emoji: string }) => {
    const { error } = await tryCatch(dexieDB.notes.update(note.id, { emoji }))

    if (error) {
      toast.error(error.message)
    }

    setEmoji(emoji)
    setIsPickerOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <input type="hidden" name="icon" required />
        <div className="flex items-center gap-2">
          <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => setIsPickerOpen(!isPickerOpen)}
              >
                {emoji ? (
                  <span className="text-6xl">{emoji}</span>
                ) : (
                  <FileIcon className="size-12" />
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
