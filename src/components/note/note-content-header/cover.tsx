import type { Note } from "@/lib/db-client"
import Image from "next/image"
import React from "react"

type NoteCoverProps = {
  note: Note | undefined
}
export const NoteCover: React.FC<NoteCoverProps> = ({ note }) => {
  return note?.cover ? (
    <div className="relative h-60 bg-red-500">
      <Image fill src={note.cover} alt="Note cover" className="z-10" />
    </div>
  ) : null
}
