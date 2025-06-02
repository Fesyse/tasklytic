import type { TElement } from "@udecode/plate"
import Dexie, { type EntityTable } from "dexie"
import { siteConfig } from "./site-config"

type Note = {
  id: string
  title: string
  emoji?: string
  emojiSlug?: string
  organizationId: string
  updatedAt: Date
  createdAt: Date
  updatedByUserId: string
  updatedByUserName: string
  createdByUserId: string
  createdByUserName: string
  isPublic: boolean
  parentNoteId: string | null
  isFavorited?: boolean
  isDeleted?: boolean
  favoritedByUserId?: string | null
  cover?: string
}

type Block = {
  id: string
  noteId: string
  content: TElement
  order: number
}

type Discussion = {
  id: string
  noteId: string
  blockId: string
  documentContent?: string
  createdAt: Date
  isResolved: boolean
  userId: string
}

type Comment = {
  id: string
  discussionId: string
  contentRich: any // Using any for now, but should be Value from @udecode/plate
  createdAt: Date
  isEdited: boolean
  userId: string
  userImage?: string
}

const dexieDB = new Dexie(`${siteConfig.name}Database`) as Dexie & {
  notes: EntityTable<Note, "id">
  blocks: EntityTable<Block, "id">
  discussions: EntityTable<Discussion, "id">
  comments: EntityTable<Comment, "id">
}

dexieDB.version(1).stores({
  notes:
    "&id, title, emoji, emojiSlug, isPublic, organizationId, parentNoteId, updatedByUserId, updatedByUserName, updatedAt, createdByUserId, createdByUserName, createdAt, isFavorited, favoritedByUserId, cover, [id+organizationId], isDeleted",
  blocks: "&id, noteId, content, order",
  discussions: "&id, noteId, blockId, isResolved, userId, createdAt",
  comments: "&id, discussionId, userId, createdAt, isEdited"
})

export { dexieDB }
export type { Comment, Discussion, Note }
