import type { Organization } from "better-auth/plugins/organization"

import type { User } from "better-auth"

import { createId } from "@/server/db/schema"
import { dexieDB } from "./db-client"
import { tryCatch } from "./utils"

export function createNote(data: {
  user: User
  organization: Organization
  noteId?: string
}) {
  return tryCatch(
    dexieDB.notes.add({
      id: createId(),
      title: "",
      emoji: undefined,
      isPublic: false,
      updatedAt: new Date(),
      updatedByUserId: data.user.id,
      updatedByUserName: data.user.name,
      createdByUserId: data.user.id,
      createdByUserName: data.user.name,
      createdAt: new Date(),
      organizationId: data.organization.id,
      parentNoteId: data.noteId ?? null
    })
  )
}

export function deleteNote(id: string) {
  return tryCatch(dexieDB.notes.delete(id))
}

export function getNote(id: string, organizationId: string) {
  return tryCatch(
    dexieDB.notes.where({ id, organizationId: organizationId }).first()
  )
}

export function getBlocks(noteId: string) {
  return tryCatch(dexieDB.blocks.where("noteId").equals(noteId).toArray())
}

export function getNotes(organizationId: string) {
  return tryCatch(
    dexieDB.notes.where("organizationId").equals(organizationId).toArray()
  )
}

export function getNoteWithBlocks(id: string, organizationId: string) {
  return tryCatch(
    (async () => {
      const { data: note, error: noteError } = await getNote(id, organizationId)
      if (noteError) throw noteError
      if (!note) return undefined

      const { data: blocks, error: blocksError } = await getBlocks(note.id)
      if (blocksError) throw blocksError

      return { ...note, blocks: blocks.map((block) => block.content) }
    })()
  )
}
