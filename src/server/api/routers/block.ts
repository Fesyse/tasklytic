import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { kv } from "@/server/cache"
import { blocks, type Block } from "@/server/db/schema"
import { and, eq, inArray } from "drizzle-orm"
import { z } from "zod"

const cacheKeys = {
  all: `projects:notes:blocks:all`,
  one: `projects:notes:blocks:one`
}

export const blocksRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        noteId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      // const cached = await kv.get(`${cacheKeys.all}:${input.noteId}`)
      // if (cached) return cached as Block[]

      const blocks = await ctx.db.query.blocks.findMany({
        where: (blocksTable, { and, eq }) =>
          and(eq(blocksTable.noteId, input.noteId))
      })

      kv.set(`${cacheKeys.all}:${input.noteId}`, blocks)
      kv.expire(`${cacheKeys.all}:${input.noteId}`, 1800)

      return blocks
    }),
  create: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.object({
          children: z.array(z.any()),
          type: z.string()
        }),
        noteId: z.string(),
        projectId: z.string(),
        order: z.number()
      })
    )
    .mutation(async ({ ctx, input: block }) => {
      const result = await ctx.db
        .insert(blocks)
        .values({
          ...block,
          content: { ...block.content, id: block.id }
        })
        .returning()
        .then(r => r[0]!)

      kv.del(`${cacheKeys.all}:${result.noteId}`)
      kv.set(`${cacheKeys.one}:${result.id}`, result)
      kv.expire(`${cacheKeys.one}:${result.id}`, 1800)

      return result
    }),
  updateContent: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.any(),
        noteId: z.string(),
        order: z.number(),
        projectId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const block =
        (kv.get(`${cacheKeys.one}:${input.id}`) as Block | undefined) ??
        (await ctx.db.query.blocks.findFirst({
          where: eq(blocks.id, input.id)
        }))

      if (!block) {
        const result = await ctx.db
          .insert(blocks)
          .values({
            ...input,
            content: { ...input.content, id: input.id }
          })
          .returning()
          .then(r => r[0]!)

        kv.del(`${cacheKeys.all}:${result.noteId}`)
        kv.set(`${cacheKeys.one}:${result.id}`, result)
        kv.expire(`${cacheKeys.one}:${result.id}`, 1800)

        return result
      }

      const result = await ctx.db
        .update(blocks)
        .set({ content: { ...input.content, id: input.id } })
        .where(eq(blocks.id, input.id))
        .returning()
        .then(r => r[0]!)

      kv.del(`${cacheKeys.all}:${result.noteId}`)
      kv.set(`${cacheKeys.one}:${result.id}`, result)
      kv.expire(`${cacheKeys.one}:${result.id}`, 1800)

      return result
    }),
  updateOrder: protectedProcedure
    .input(
      z.object({
        noteId: z.string(),
        ids: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input: { noteId, ids } }) => {
      await ctx.db.transaction(async trx => {
        for (let order = 0; order < ids.length; order++) {
          const blockId = ids[order]!

          // Update the order of the block
          await trx
            .update(blocks)
            .set({ order })
            .where(and(eq(blocks.id, blockId), eq(blocks.noteId, noteId)))
        }
      })

      kv.del(`${cacheKeys.all}:${noteId}`)
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        noteId: z.string(),
        projectId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(blocks).where(eq(blocks.id, input.id))

      kv.del(`${cacheKeys.all}:${input.noteId}`)
      kv.del(`${cacheKeys.one}:${input.id}`)
    }),
  deleteMany: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        noteId: z.string(),
        projectId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(blocks).where(inArray(blocks.id, input.ids))

      kv.del(`${cacheKeys.all}:${input.noteId}`)
    })
})
