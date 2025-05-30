"use client"

import { NoteEmojiPicker } from "@/components/note/note-emoji-picker"
import { NoteTitleInput } from "@/components/note/note-title-input"

import { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"

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
      {isAddingEmoji ? (
        <Loader2 className="text-muted-foreground size-12 animate-spin" />
      ) : note?.emoji ? (
        <NoteEmojiPicker />
      ) : null}
      <NoteTitleInput />
    </div>
  )
}
