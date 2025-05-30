"use client"

import { NoteEmojiPicker } from "@/components/note/note-emoji-picker"
import { NoteTitleInput } from "@/components/note/note-title-input"

import { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"

import { AnimatePresence, motion } from "motion/react"
import { NoteEmojiButton } from "./emoji-button"
import { NoteFavoriteButton } from "./favorite-button"

export const NoteContentHeader = () => {
  const [isAddingEmoji, setIsAddingEmoji] = useState(false)
  const { noteId } = useParams<{ noteId: string }>()
  const { note, updateNoteEmoji, updateNoteFavorite } =
    useSyncedNoteQueries(noteId)

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
          <NoteEmojiButton
            note={note}
            updateNoteEmoji={updateNoteEmoji}
            isAddingEmoji={isAddingEmoji}
            setIsAddingEmoji={setIsAddingEmoji}
          />
          <NoteFavoriteButton
            note={note}
            updateNoteFavorite={updateNoteFavorite}
          />
        </div>
      </div>
      <div
        className={cn("linear relative transition-all duration-200", {
          "size-12": isAddingEmoji || note?.emoji
        })}
      >
        <AnimatePresence>
          {isAddingEmoji ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="text-muted-foreground size-12 animate-spin" />
            </motion.div>
          ) : note?.emoji ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <NoteEmojiPicker />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <NoteTitleInput />
    </div>
  )
}
