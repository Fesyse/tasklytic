import type { Organization } from "better-auth/plugins/organization"

import type { User } from "better-auth"

import { createId } from "@/server/db/schema"
import { dexieDB } from "./db-client"
import { tryCatch, type Result } from "./utils"

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
      emojiSlug: undefined,
      isPublic: false,
      updatedAt: new Date(),
      updatedByUserId: data.user.id,
      updatedByUserName: data.user.name,
      createdByUserId: data.user.id,
      createdByUserName: data.user.name,
      createdAt: new Date(),
      organizationId: data.organization.id,
      parentNoteId: data.noteId ?? null,
      isFavorited: false,
      favoritedByUserId: null
    })
  )
}

export function deleteNote(
  id: string,
  strict = true
): Promise<Result<void, Error>> {
  return tryCatch(
    strict
      ? Promise.all([
          dexieDB.notes.delete(id),
          dexieDB.notes.where("parentNoteId").equals(id).delete()
        ]).then(() => undefined)
      : dexieDB.notes.update(id, { isDeleted: true }).then(() => undefined)
  )
}

export function getNote(id: string, organizationId: string) {
  return tryCatch(
    dexieDB.notes
      .where({ id, organizationId: organizationId })
      .and((note) => !note.isDeleted)
      .first()
  )
}

export function getNotesByIds(noteIds: string[]) {
  return tryCatch(
    dexieDB.notes
      .where("id")
      .anyOf(noteIds)
      .and((note) => !note.isDeleted)
      .toArray()
  )
}
export function getBlocks(noteId: string) {
  return tryCatch(dexieDB.blocks.where("noteId").equals(noteId).toArray())
}

export function getNotes(organizationId: string) {
  return tryCatch(
    dexieDB.notes
      .where("organizationId")
      .equals(organizationId)
      .and((note) => !note.isDeleted)
      .toArray()
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

export function updateNoteEmoji(data: {
  id: string
  emoji: string
  emojiSlug: string
}) {
  return tryCatch(
    dexieDB.notes.update(data.id, {
      emoji: data.emoji,
      emojiSlug: data.emojiSlug
    })
  )
}

export async function deleteNotes(organizationId: string, ids?: string[]) {
  if (!ids) {
    const notes = await dexieDB.notes
      .where("organizationId")
      .equals(organizationId)
      .and((note) => !!note.isDeleted)
      .toArray()
    ids = notes.map((note) => note.id)

    if (!ids.length) return
  }

  return tryCatch(
    Promise.all([
      dexieDB.notes.bulkDelete(ids),
      dexieDB.blocks.where("noteId").anyOf(ids).delete()
    ])
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
