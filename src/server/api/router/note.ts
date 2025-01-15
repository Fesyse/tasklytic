import { asc, desc, eq, like, or } from "drizzle-orm"
import { z } from "zod"
import { searchQueryFormat } from "@/lib/utils"
import { blockContent, order, sortBy } from "@/lib/schemas"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { kv } from "@/server/cache"
import { blocks, createCuid, notes, type Note } from "@/server/db/schema"

const cacheKeys = {
  all: `projects:notes:all`,
  one: `projects:notes:one`,
  pinned: `projects:notes:all:pinned`,
  unpinned: `projects:notes:all:unpinned`
}

export const notesRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const key = `${cacheKeys.one}:${input.id}`
      const cached = await kv.get(key)
      if (cached) return cached as Note

      const result = await ctx.db.query.notes.findFirst({
        where: (notesTable, { and, not, eq }) =>
          or(
            // if user is owner of the note, then we showing private note
            and(
              eq(notesTable.id, input.id),
              not(eq(notesTable.userId, ctx.session.user.id))
            ),
            // otherwise we only showing public note
            and(eq(notesTable.id, input.id), eq(notesTable.private, false))
          )
      })
      kv.set(key, result)
      kv.expire(key, 3200)

      return result
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        filters: z
          .object({
            sortBy: z.enum(sortBy).optional(),
            order: z.enum(order).optional(),
            search: z.string().optional()
          })
          .optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const key = `${cacheKeys.all}:${input.projectId}`
      // const cached = await kv.get(key)
      // if (cached) return cached as Note[]

      const columnSortBy = input.filters
        ? input.filters.sortBy !== "alphabetical"
          ? input.filters.sortBy
          : "title"
        : undefined

      const result: Note[] = await ctx.db.query.notes.findMany({
        orderBy: input.filters
          ? [
              input.filters.order === "desc"
                ? desc(notes[columnSortBy ?? "title"])
                : asc(notes[columnSortBy ?? "title"])
            ]
          : undefined,
        where: (notesTable, { and, not, eq }) =>
          and(
            input.filters?.search
              ? like(notesTable.title, searchQueryFormat(input.filters.search))
              : undefined,
            or(
              // if user is owner of the note, then we showing private note
              and(
                eq(notesTable.projectId, input.projectId),
                not(eq(notesTable.userId, ctx.session.user.id))
              ),
              // otherwise we only showing public note
              and(
                eq(notesTable.projectId, input.projectId),
                eq(notesTable.private, false)
              )
            )
          )
      })
      kv.set(key, result)
      kv.expire(key, 1800)

      return result
    }),

  getAllPinned: protectedProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const key = `${cacheKeys.pinned}:${input.projectId}`
      const cached = await kv.get(key)
      if (cached) return cached as Note[]

      const result: Note[] = await ctx.db.query.notes.findMany({
        where: (notesTable, { and, not, eq }) =>
          and(
            or(
              // if user is owner of the note, then we showing private note
              and(
                eq(notesTable.projectId, input.projectId),
                not(eq(notesTable.userId, ctx.session.user.id))
              ),
              // otherwise we only showing public note
              and(
                eq(notesTable.projectId, input.projectId),
                eq(notesTable.private, false)
              )
            ),
            eq(notesTable.isPinned, true)
          )
      })
      kv.set(key, result)
      kv.expire(key, 1800)

      return result
    }),
  getAllUnpinned: protectedProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const key = `${cacheKeys.unpinned}:${input.projectId}`

      const cached = await kv.get(key)
      if (cached) return cached as Note[]

      const result: Note[] = await ctx.db.query.notes.findMany({
        where: (notesTable, { and, not, eq }) =>
          and(
            or(
              // if user is owner of the note, then we showing private note
              and(
                eq(notesTable.projectId, input.projectId),
                not(eq(notesTable.userId, ctx.session.user.id))
              ),
              // otherwise we only showing public note
              and(
                eq(notesTable.projectId, input.projectId),
                eq(notesTable.private, false)
              )
            ),
            eq(notesTable.isPinned, false)
          )
      })
      kv.set(key, result)
      kv.expire(key, 1800)

      return result
    }),
  getAllRoot: protectedProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const notes = await ctx.db.query.notes.findMany({
        where: (notesTable, { and, eq, isNull }) =>
          and(
            eq(notesTable.projectId, input.projectId),
            // that way we get notes without a folder
            isNull(notesTable.folderId)
          )
      })

      return notes
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        content: blockContent.optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(notes)
        .values({
          projectId: input.projectId,
          userId: ctx.session.user.id,
          private: false,
          isPinned: false
        })
        .returning()
        .then(r => r[0]!)

      if (input.content) {
        ctx.db.transaction(async trx => {
          for (let i = 0; i < input.content!.length; i++) {
            const block = input.content![i]!

            await trx
              .insert(blocks)
              .values({
                id: createCuid(),
                content: block,
                noteId: result.id,
                projectId: input.projectId,
                order: i
              })
              .returning()
              .then(r => r[0]!)
          }
        })
      }

      kv.del(`${cacheKeys.all}:${input.projectId}`)

      return result
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().max(20).optional(),
        private: z.boolean().optional(),
        isPinned: z.boolean().optional(),
        emoji: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(notes)
        .set(input)
        .where(eq(notes.id, input.id))
        .returning()
        .then(r => r[0]!)

      const key = `${cacheKeys.one}:${input.id}`

      kv.del(`${cacheKeys.all}:${result.projectId}`)
      kv.set(key, result)
      kv.expire(key, 3200)

      return result
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .delete(notes)
        .where(eq(notes.id, input.id))
        .returning()
        .then(r => r[0]!)

      kv.del(`${cacheKeys.all}:${result.projectId}`)
      kv.del(`${cacheKeys.one}:${result.id}`)

      return result
    })
})
