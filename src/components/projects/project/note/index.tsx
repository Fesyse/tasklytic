"use client"

import { type Block } from "@/server/db/schema"
import { type FC } from "react"

type NoteProps = {
  blocks: Block[]
  className?: string
}

export const Note: FC<NoteProps> = ({ className, blocks }) => {
  return <div className={className}></div>
}
