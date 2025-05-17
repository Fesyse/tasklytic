import type { TElement } from "@udecode/plate"
import Dexie, { type EntityTable } from "dexie"
import { siteConfig } from "./site-config"

type Note = {
  id: string
  title: string
  emoji?: string
  organizationId: string
  updatedAt: Date
  createdAt: Date
  updatedByUserId: string
  createdByUserId: string
  isPublic: boolean
}

type Block = {
  id: string
  noteId: string
  content: TElement
}

const dexieDB = new Dexie(`${siteConfig.name}Database`) as Dexie & {
  notes: EntityTable<Note, "id">
  blocks: EntityTable<Block, "id">
}

dexieDB.version(1).stores({
  notes:
    "&id, title, emoji, isPublic, organizationId, updatedByUserId, updatedAt, createdByUserId, createdAt",
  blocks: "&id, noteId, content"
})

export { dexieDB }
export type { Note }
