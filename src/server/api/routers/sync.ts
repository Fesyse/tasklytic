import { eq, inArray } from "drizzle-orm"
import { z } from "zod"

import {
  blocks,
  comments,
  discussions,
  notes,
  type Block,
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
  parentNoteId: z.string().nullable(),
  isFavorited: z.boolean().optional(),
  favoritedByUserId: z.string().nullable(),
  cover: z.string().optional()
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
  updatedAt: z.date(),
  createdAt: z.date(),
  isResolved: z.boolean(),
  userId: z.string()
})

const updateCommentSchema = z.object({
  id: z.string(),
  discussionId: z.string(),
  contentRich: z.any(),
  updatedAt: z.date(),
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
      return (
        await ctx.db.query.comments.findMany({
          where: eq(comments.discussionId, input.discussionId)
        })
      ).map((comment) => ({
        ...comment,
        contentRich: JSON.parse(comment.contentRich)
      }))
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
            parentNoteId: clientNote.parentNoteId,
            isFavorited: clientNote.isFavorited ?? false,
            favoritedByUserId: clientNote.favoritedByUserId ?? null,
            cover: clientNote.cover
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
              parentNoteId: clientNote.parentNoteId,
              isFavorited:
                clientNote.isFavorited ?? serverNote.isFavorited ?? false,
              favoritedByUserId:
                clientNote.favoritedByUserId ??
                serverNote.favoritedByUserId ??
                null,
              cover: clientNote.cover
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

      // Get all server discussions for this note
      const serverDiscussions = await ctx.db.query.discussions.findMany({
        where: eq(discussions.noteId, noteId)
      })
      const serverMap = new Map(serverDiscussions.map((d) => [d.id, d]))

      // For upserting and for sending back to client
      const upserts: (typeof discussions.$inferInsert)[] = []
      const merged: (typeof discussions.$inferInsert)[] = []

      // 1. Merge client discussions into server
      for (const client of clientDiscussions) {
        const server = serverMap.get(client.id)
        if (!server) {
          // Not on server, insert
          upserts.push(client)
          merged.push(client)
        } else {
          // Both exist, compare updatedAt
          const clientDate = new Date(client.updatedAt)
          const serverDate = new Date(server.updatedAt)
          if (clientDate > serverDate) {
            // Client is newer, update server
            upserts.push(client)
            merged.push(client)
          } else {
            // Server is newer or same, keep server
            merged.push(server)
          }
          serverMap.delete(client.id)
        }
      }

      // 2. Add server-only discussions to merged
      for (const server of serverMap.values()) {
        merged.push(server)
      }

      // 3. Upsert to server
      if (upserts.length > 0) await ctx.db.insert(discussions).values(upserts)

      // 4. Return all merged discussions for the note
      return merged
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

      // Get all server comments for this discussion
      const serverComments = await ctx.db.query.comments.findMany({
        where: eq(comments.discussionId, discussionId)
      })
      const serverMap = new Map(serverComments.map((c) => [c.id, c]))

      const upserts: (typeof comments.$inferInsert)[] = []
      const merged: (typeof comments.$inferInsert)[] = []

      // 1. Merge client comments into server
      for (const client of clientComments) {
        const server = serverMap.get(client.id)
        if (!server) {
          upserts.push(client)
          merged.push(client)
        } else {
          const clientDate = new Date(client.updatedAt)
          const serverDate = new Date(server.updatedAt)
          if (clientDate > serverDate) {
            upserts.push(client)
            merged.push(client)
          } else {
            merged.push(server)
          }
          serverMap.delete(client.id)
        }
      }

      // 2. Add server-only comments to merged
      for (const server of serverMap.values()) {
        merged.push(server)
      }

      // 3. Upsert to server
      if (upserts.length > 0)
        await ctx.db.insert(comments).values(
          upserts.map((comment) => ({
            ...comment,
            contentRich: JSON.stringify(comment.contentRich)
          }))
        )

      // 4. Return all merged comments for the discussion
      return merged.map((comment) => ({
        ...comment,
        contentRich: JSON.parse(comment.contentRich)
      }))
    })
})
