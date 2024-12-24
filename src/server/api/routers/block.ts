import { and, eq, inArray } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { kv } from "@/server/cache"
import { blocks } from "@/server/db/schema"

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
  updateOrCreateBlock: protectedProcedure
    .input(
      z.object({
        blocks: z.array(
          z.object({ id: z.string(), order: z.number(), content: z.any() })
        ),
        noteId: z.string(),
        projectId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      ctx.db.transaction(async trx => {
        for (const updatingBlock of input.blocks) {
          const block = await ctx.db.query.blocks.findFirst({
            where: (blocksTable, { eq }) => eq(blocksTable.id, updatingBlock.id)
          })

          if (!block) {
            await trx
              .insert(blocks)
              .values({
                id: updatingBlock.id,
                order: updatingBlock.order,
                content: { ...updatingBlock.content, id: updatingBlock.id },
                noteId: input.noteId,
                projectId: input.projectId
              })
              .returning()
              .then(r => r[0]!)

            kv.del(`${cacheKeys.all}:${input.noteId}`)
          } else {
            await trx
              .update(blocks)
              .set({ content: { ...updatingBlock.content, id: block.id } })
              .where(eq(blocks.id, block.id))
              .returning()
              .then(r => r[0]!)
          }
        }
      })
      kv.del(`${cacheKeys.all}:${input.noteId}`)

      return true
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
