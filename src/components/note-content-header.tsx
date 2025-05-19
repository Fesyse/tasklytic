"use client"

import { NoteTitleInput } from "./note-title-input"

import { useNote } from "@/hooks/use-note"
import { SmilePlus } from "lucide-react"
import { NoteEmojiPicker } from "./note-emoji-picker"
import { Button } from "./ui/button"

export const NoteContentHeader = () => {
  const { data: note } = useNote()

  return (
    <div className="group relative mx-auto mb-12 flex w-full max-w-[51rem] items-center gap-4 px-15 pt-40">
      <div className="text-muted-foreground absolute bottom-12 left-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {!note?.emoji ? (
          <Button variant="ghost" size="sm" className="rounded-xl">
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
