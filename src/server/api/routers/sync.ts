import { eq, inArray } from "drizzle-orm"
import { z } from "zod"

import {
  blocks,
  comments,
  discussions,
  notes,
  type Block,
  type Comment,
  type Discussion,
  type Note
} from "@/server/db/schema"
import { createTRPCRouter, protectedProcedure } from "../trpc"

// Types for sync operations
const syncNotesQuerySchema = z.object({
  organizationId: z.string()
})

const syncBlocksQuerySchema = z.object({
  noteId: z.string()
})

const syncDiscussionsQuerySchema = z.object({
  noteId: z.string()
})

const syncCommentsQuerySchema = z.object({
  discussionId: z.string()
})

// Types for update operations
const updateNoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  emoji: z.string().optional(),
  emojiSlug: z.string().optional(),
  organizationId: z.string(),
  updatedAt: z.date(),
  createdAt: z.date(),
  updatedByUserId: z.string(),
  updatedByUserName: z.string(),
  createdByUserId: z.string(),
  createdByUserName: z.string(),
  isPublic: z.boolean(),
  parentNoteId: z.string().nullable()
})

const updateBlockSchema = z.object({
  id: z.string(),
  noteId: z.string(),
  content: z.any(), // Using any for content
  order: z.number()
})

const updateDiscussionSchema = z.object({
  id: z.string(),
  noteId: z.string(),
  blockId: z.string(),
  documentContent: z.string().optional(),
  createdAt: z.date(),
  isResolved: z.boolean(),
  userId: z.string()
})

const updateCommentSchema = z.object({
  id: z.string(),
  discussionId: z.string(),
  contentRich: z.any(), // Using any for contentRich
  createdAt: z.date(),
  isEdited: z.boolean(),
  userId: z.string()
})

// Types for bulk update operations
const bulkUpdateNotesSchema = z.array(updateNoteSchema)
const bulkUpdateBlocksSchema = z.array(updateBlockSchema)
const bulkUpdateDiscussionsSchema = z.array(updateDiscussionSchema)
const bulkUpdateCommentsSchema = z.array(updateCommentSchema)

export const syncRouter = createTRPCRouter({
  // GET operations - fetch data from server
  getNotes: protectedProcedure
    .input(syncNotesQuerySchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.notes.findMany({
        where: eq(notes.organizationId, input.organizationId)
      })
    }),

  getBlocks: protectedProcedure
    .input(syncBlocksQuerySchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.blocks.findMany({
        where: eq(blocks.noteId, input.noteId)
      })
    }),

  getDiscussions: protectedProcedure
    .input(syncDiscussionsQuerySchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.discussions.findMany({
        where: eq(discussions.noteId, input.noteId)
      })
    }),

  getComments: protectedProcedure
    .input(syncCommentsQuerySchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.comments.findMany({
        where: eq(comments.discussionId, input.discussionId)
      })
    }),

  // SYNC operations - send client changes to server
  syncNotes: protectedProcedure
    .input(
      z.object({
        notes: bulkUpdateNotesSchema,
        organizationId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { notes: clientNotes, organizationId } = input

      // Get existing notes from the server
      const serverNotes = await ctx.db.query.notes.findMany({
        where: eq(notes.organizationId, organizationId)
      })

      const serverNotesMap = new Map<string, Note>()
      serverNotes.forEach((note) => serverNotesMap.set(note.id, note))

      // Prepare operations
      const notesToInsert: (typeof notes.$inferInsert)[] = []
      const notesToUpdate: (typeof notes.$inferInsert)[] = []

      // Process client notes
      for (const clientNote of clientNotes) {
        const serverNote = serverNotesMap.get(clientNote.id)

        if (!serverNote) {
          // Note doesn't exist on server, create it
          notesToInsert.push({
            id: clientNote.id,
            title: clientNote.title,
            emoji: clientNote.emoji,
            emojiSlug: clientNote.emojiSlug,
            organizationId: clientNote.organizationId,
            updatedAt: clientNote.updatedAt,
            createdAt: clientNote.createdAt,
            updatedByUserId: clientNote.updatedByUserId,
            updatedByUserName: clientNote.updatedByUserName,
            createdByUserId: clientNote.createdByUserId,
            createdByUserName: clientNote.createdByUserName,
            isPublic: clientNote.isPublic,
            parentNoteId: clientNote.parentNoteId
          })
        } else {
          // Note exists, check if client has a newer version
          const serverDate = new Date(serverNote.updatedAt)
          const clientDate = new Date(clientNote.updatedAt)

          if (clientDate > serverDate) {
            // Client has newer version, update server
            notesToUpdate.push({
              id: clientNote.id,
              title: clientNote.title,
              emoji: clientNote.emoji,
              emojiSlug: clientNote.emojiSlug,
              organizationId: clientNote.organizationId,
              updatedAt: clientNote.updatedAt,
              createdAt: clientNote.createdAt,
              updatedByUserId: clientNote.updatedByUserId,
              updatedByUserName: clientNote.updatedByUserName,
              createdByUserId: clientNote.createdByUserId,
              createdByUserName: clientNote.createdByUserName,
              isPublic: clientNote.isPublic,
              parentNoteId: clientNote.parentNoteId
            })
          }
        }
      }

      // Execute operations
      if (notesToInsert.length > 0) {
        await ctx.db.insert(notes).values(notesToInsert)
      }

      for (const note of notesToUpdate) {
        await ctx.db.update(notes).set(note).where(eq(notes.id, note.id))
      }

      // Return all server notes after the operations
      return await ctx.db.query.notes.findMany({
        where: eq(notes.organizationId, organizationId)
      })
    }),

  syncBlocks: protectedProcedure
    .input(
      z.object({
        blocks: bulkUpdateBlocksSchema,
        noteId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { blocks: clientBlocks, noteId } = input

      // Get existing blocks from the server
      const serverBlocks = await ctx.db.query.blocks.findMany({
        where: eq(blocks.noteId, noteId)
      })

      const serverBlocksMap = new Map<string, Block>()
      serverBlocks.forEach((block) => serverBlocksMap.set(block.id, block))

      // Find blocks to insert, update, or delete
      const blocksToInsert: (typeof blocks.$inferInsert)[] = []
      const blocksToUpdate: (typeof blocks.$inferInsert)[] = []
      const existingBlockIds = new Set<string>()

      // Process client blocks
      for (const clientBlock of clientBlocks) {
        existingBlockIds.add(clientBlock.id)
        const serverBlock = serverBlocksMap.get(clientBlock.id)

        if (!serverBlock) {
          // Block doesn't exist on server, create it
          blocksToInsert.push({
            id: clientBlock.id,
            noteId: clientBlock.noteId,
            content: JSON.stringify(clientBlock.content), // Convert to string for storage
            order: clientBlock.order
          })
        } else {
          // Block exists, update it (for simplicity, always update blocks)
          blocksToUpdate.push({
            id: clientBlock.id,
            noteId: clientBlock.noteId,
            content: JSON.stringify(clientBlock.content), // Convert to string for storage
            order: clientBlock.order
          })
        }
      }

      // Find blocks to delete (blocks on server that are not in client)
      const blocksToDeleteIds = serverBlocks
        .filter((block) => !existingBlockIds.has(block.id))
        .map((block) => block.id)

      // Execute operations
      if (blocksToInsert.length > 0) {
        await ctx.db.insert(blocks).values(blocksToInsert)
      }

      for (const block of blocksToUpdate) {
        await ctx.db.update(blocks).set(block).where(eq(blocks.id, block.id))
      }

      if (blocksToDeleteIds.length > 0) {
        await ctx.db.delete(blocks).where(inArray(blocks.id, blocksToDeleteIds))
      }

      // Return all blocks for the note after the operations
      return await ctx.db.query.blocks.findMany({
        where: eq(blocks.noteId, noteId)
      })
    }),

  syncDiscussions: protectedProcedure
    .input(
      z.object({
        discussions: bulkUpdateDiscussionsSchema,
        noteId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { discussions: clientDiscussions, noteId } = input

      // Get existing discussions from the server
      const serverDiscussions = await ctx.db.query.discussions.findMany({
        where: eq(discussions.noteId, noteId)
      })

      const serverDiscussionsMap = new Map<string, Discussion>()
      serverDiscussions.forEach((discussion) =>
        serverDiscussionsMap.set(discussion.id, discussion)
      )

      // Find discussions to insert, update, or delete
      const discussionsToInsert: (typeof discussions.$inferInsert)[] = []
      const discussionsToUpdate: (typeof discussions.$inferInsert)[] = []
      const existingDiscussionIds = new Set<string>()

      // Process client discussions
      for (const clientDiscussion of clientDiscussions) {
        existingDiscussionIds.add(clientDiscussion.id)
        const serverDiscussion = serverDiscussionsMap.get(clientDiscussion.id)

        if (!serverDiscussion) {
          // Discussion doesn't exist on server, create it
          discussionsToInsert.push({
            id: clientDiscussion.id,
            noteId: clientDiscussion.noteId,
            blockId: clientDiscussion.blockId,
            documentContent: clientDiscussion.documentContent,
            createdAt: clientDiscussion.createdAt,
            isResolved: clientDiscussion.isResolved,
            userId: clientDiscussion.userId
          })
        } else {
          // Discussion exists, update it
          discussionsToUpdate.push({
            id: clientDiscussion.id,
            noteId: clientDiscussion.noteId,
            blockId: clientDiscussion.blockId,
            documentContent: clientDiscussion.documentContent,
            createdAt: clientDiscussion.createdAt,
            isResolved: clientDiscussion.isResolved,
            userId: clientDiscussion.userId
          })
        }
      }

      // Find discussions to delete
      const discussionsToDeleteIds = serverDiscussions
        .filter((discussion) => !existingDiscussionIds.has(discussion.id))
        .map((discussion) => discussion.id)

      // Execute operations
      if (discussionsToInsert.length > 0) {
        await ctx.db.insert(discussions).values(discussionsToInsert)
      }

      for (const discussion of discussionsToUpdate) {
        await ctx.db
          .update(discussions)
          .set(discussion)
          .where(eq(discussions.id, discussion.id))
      }

      if (discussionsToDeleteIds.length > 0) {
        await ctx.db
          .delete(discussions)
          .where(inArray(discussions.id, discussionsToDeleteIds))
      }

      // Return all discussions for the note after the operations
      return await ctx.db.query.discussions.findMany({
        where: eq(discussions.noteId, noteId)
      })
    }),

  syncComments: protectedProcedure
    .input(
      z.object({
        comments: bulkUpdateCommentsSchema,
        discussionId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { comments: clientComments, discussionId } = input

      // Get existing comments from the server
      const serverComments = await ctx.db.query.comments.findMany({
        where: eq(comments.discussionId, discussionId)
      })

      const serverCommentsMap = new Map<string, Comment>()
      serverComments.forEach((comment) =>
        serverCommentsMap.set(comment.id, comment)
      )

      // Find comments to insert, update, or delete
      const commentsToInsert: (typeof comments.$inferInsert)[] = []
      const commentsToUpdate: (typeof comments.$inferInsert)[] = []
      const existingCommentIds = new Set<string>()

      // Process client comments
      for (const clientComment of clientComments) {
        existingCommentIds.add(clientComment.id)
        const serverComment = serverCommentsMap.get(clientComment.id)

        if (!serverComment) {
          // Comment doesn't exist on server, create it
          commentsToInsert.push({
            id: clientComment.id,
            discussionId: clientComment.discussionId,
            contentRich: JSON.stringify(clientComment.contentRich), // Convert to string for storage
            createdAt: clientComment.createdAt,
            isEdited: clientComment.isEdited,
            userId: clientComment.userId
          })
        } else {
          // Comment exists, update it (only if client comment has isEdited = true)
          if (clientComment.isEdited) {
            commentsToUpdate.push({
              id: clientComment.id,
              discussionId: clientComment.discussionId,
              contentRich: JSON.stringify(clientComment.contentRich), // Convert to string for storage
              createdAt: clientComment.createdAt,
              isEdited: clientComment.isEdited,
              userId: clientComment.userId
            })
          }
        }
      }

      // Find comments to delete
      const commentsToDeleteIds = serverComments
        .filter((comment) => !existingCommentIds.has(comment.id))
        .map((comment) => comment.id)

      // Execute operations
      if (commentsToInsert.length > 0) {
        await ctx.db.insert(comments).values(commentsToInsert)
      }

      for (const comment of commentsToUpdate) {
        await ctx.db
          .update(comments)
          .set(comment)
          .where(eq(comments.id, comment.id))
      }

      if (commentsToDeleteIds.length > 0) {
        await ctx.db
          .delete(comments)
          .where(inArray(comments.id, commentsToDeleteIds))
      }

      // Return all comments for the discussion after the operations
      return await ctx.db.query.comments.findMany({
        where: eq(comments.discussionId, discussionId)
      })
    })
})
