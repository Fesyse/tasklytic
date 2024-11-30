import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { kv } from "@/server/cache"
import { blocks, type Block } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

export const blocksRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        noteId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const cached = (await kv.get(
        `projects:notes:blocks:${input.noteId}`
      )) as Block[]
      if (cached) return cached

      const blocks = (await ctx.db.query.blocks.findMany({
        where: (blocksTable, { and, eq }) =>
          and(eq(blocksTable.noteId, input.noteId))
      })) satisfies Block[]
      kv.set(`projects:notes:blocks:${input.noteId}`, blocks)
      kv.expire(`projects:notes:blocks:${input.noteId}`, 1800)

      return blocks
    }),
  updateOrder: protectedProcedure
    .input(
      z.object({
        noteId: z.string(),
        ids: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input: { noteId, ids } }) => {
      return ctx.db.transaction(async trx => {
        for (let order = 0; order < ids.length; order++) {
          const blockId = ids[order]!

          // Update the order of the block
          await trx
            .update(blocks)
            .set({ order })
            .where(and(eq(blocks.id, blockId), eq(blocks.noteId, noteId)))
        }
      })
    })
})
