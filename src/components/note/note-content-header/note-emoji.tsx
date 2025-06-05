import { NoteEmojiPicker } from "@/components/note/note-emoji-picker"
import type { Note } from "@/lib/db-client"
import { Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React from "react"

type NoteEmojiProps = {
  isAddingEmoji: boolean
  note: Note | undefined
  size?: number
}

export const NoteEmoji: React.FC<NoteEmojiProps> = ({
  isAddingEmoji,
  note,
  size = 48
}) => {
  return (
    <div
      className="linear relative transition-all duration-200"
      style={
        isAddingEmoji || note?.emoji
          ? {
              width: size,
              height: size
            }
          : undefined
      }
    >
      <AnimatePresence>
        {isAddingEmoji ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-2"
          >
            <Loader2
              className="text-muted-foreground animate-spin"
              width={size - 8}
              height={size - 8}
            />
          </motion.div>
        ) : note?.emoji ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <NoteEmojiPicker size={size} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
