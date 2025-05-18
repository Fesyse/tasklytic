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

// Discussion and Comment queries
export function createDiscussion(data: {
  noteId: string
  blockId: string
  documentContent?: string
  userId: string
}) {
  return tryCatch(
    dexieDB.discussions.add({
      id: createId(),
      noteId: data.noteId,
      blockId: data.blockId,
      documentContent: data.documentContent,
      createdAt: new Date(),
      isResolved: false,
      userId: data.userId
    })
  )
}

export function getDiscussions(noteId: string) {
  return tryCatch(dexieDB.discussions.where("noteId").equals(noteId).toArray())
}

export function getDiscussion(id: string) {
  return tryCatch(dexieDB.discussions.get(id))
}

export function updateDiscussionResolved(id: string, isResolved: boolean) {
  return tryCatch(dexieDB.discussions.update(id, { isResolved }))
}

export function deleteDiscussion(id: string) {
  return tryCatch(dexieDB.discussions.delete(id))
}

export function createComment(data: {
  discussionId: string
  contentRich: any
  userId: string
}) {
  return tryCatch(
    dexieDB.comments.add({
      id: createId(),
      discussionId: data.discussionId,
      contentRich: data.contentRich,
      createdAt: new Date(),
      isEdited: false,
      userId: data.userId
    })
  )
}

export function getComments(discussionId: string) {
  return tryCatch(
    dexieDB.comments.where("discussionId").equals(discussionId).toArray()
  )
}

export function updateComment(id: string, contentRich: any) {
  return tryCatch(dexieDB.comments.update(id, { contentRich, isEdited: true }))
}

export function deleteComment(id: string) {
  return tryCatch(dexieDB.comments.delete(id))
}

export function getDiscussionWithComments(id: string) {
  return tryCatch(
    (async () => {
      const { data: discussion, error: discussionError } =
        await getDiscussion(id)
      if (discussionError) throw discussionError
      if (!discussion) return undefined

      const { data: comments, error: commentsError } = await getComments(
        discussion.id
      )
      if (commentsError) throw commentsError

      return { ...discussion, comments }
    })()
  )
}
