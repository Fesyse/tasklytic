"use client"

import { NoteTitleInput } from "@/components/note/note-title-input"

import { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useState } from "react"

import { NoteCover } from "./cover"
import { NoteCoverButton } from "./cover-button"
import { NoteEmojiButton } from "./emoji-button"
import { NoteFavoriteButton } from "./favorite-button"
import { NoteEmoji } from "./note-emoji"

export const NoteContentHeader = () => {
  const [isAddingEmoji, setIsAddingEmoji] = useState(false)
  const { noteId } = useParams<{ noteId: string }>()
  const { note, updateNoteEmoji, updateNoteFavorite } =
    useSyncedNoteQueries(noteId)

  return (
    <>
      <NoteCover note={note} />
      <div
        className={cn(
          "group relative mx-auto mb-8 flex w-full max-w-[51rem] items-center px-15",
          {
            "pt-20": note?.cover,
            "pt-40": !note?.cover,
            "gap-4": note?.emoji
          }
        )}
      >
        <div
          className={cn("text-muted-foreground absolute bottom-12 left-12", {
            "bottom-16": note?.emoji && !note?.cover
          })}
        >
          {note?.cover ? (
            <div className="absolute bottom-[calc(100%+var(--spacing)*4)] left-0 z-10">
              <NoteEmoji size={84} isAddingEmoji={isAddingEmoji} note={note} />
            </div>
          ) : null}
          <div className="flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <NoteEmojiButton
              note={note}
              updateNoteEmoji={updateNoteEmoji}
              isAddingEmoji={isAddingEmoji}
              setIsAddingEmoji={setIsAddingEmoji}
            />
            <NoteCoverButton note={note} />
            <NoteFavoriteButton
              note={note}
              updateNoteFavorite={updateNoteFavorite}
            />
          </div>
        </div>
        {!note?.cover ? (
          <NoteEmoji isAddingEmoji={isAddingEmoji} note={note} />
        ) : null}
        <NoteTitleInput />
      </div>
    </>
  )
}
