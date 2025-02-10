import { and, eq, inArray } from "drizzle-orm"
import { z } from "zod"
import { getNoteSlug } from "@/lib/pusher-slugs"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { blocks } from "@/server/db/schema"
import { pusherServer } from "@/server/pusher"

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
      const blocks = await ctx.db.query.blocks.findMany({
        where: (blocksTable, { and, eq }) =>
          and(eq(blocksTable.noteId, input.noteId))
      })

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

      return result
    }),
  updateOrCreateBlocks: protectedProcedure
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
      await Promise.all([
        ctx.db.transaction(async trx => {
          for (const updatingBlock of input.blocks) {
            const block = await ctx.db.query.blocks.findFirst({
              where: (blocksTable, { eq }) =>
                eq(blocksTable.id, updatingBlock.id)
            })

            if (!block) {
              await trx.insert(blocks).values({
                id: updatingBlock.id,
                order: updatingBlock.order,
                content: { ...updatingBlock.content, id: updatingBlock.id },
                noteId: input.noteId,
                projectId: input.projectId
              })
            } else {
              await trx
                .update(blocks)
                .set({ content: { ...updatingBlock.content, id: block.id } })
                .where(eq(blocks.id, block.id))
            }
          }
        }),
        pusherServer.trigger(
          getNoteSlug(input.projectId, input.noteId),
          "update",
          {}
        )
      ])

      return true
    }),
  updateOrder: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        noteId: z.string(),
        ids: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all([
        ctx.db.transaction(async trx => {
          for (let order = 0; order < input.ids.length; order++) {
            const blockId = input.ids[order]!

            // Update the order of the block
            await trx
              .update(blocks)
              .set({ order })
              .where(
                and(eq(blocks.id, blockId), eq(blocks.noteId, input.noteId))
              )
          }
        }),
        pusherServer.trigger(
          getNoteSlug(input.projectId, input.noteId),
          "update",
          {}
        )
      ])
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
      await Promise.all([
        ctx.db.delete(blocks).where(eq(blocks.id, input.id)),
        pusherServer.trigger(
          getNoteSlug(input.projectId, input.noteId),
          "update",
          {}
        )
      ])
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
      await Promise.all([
        ctx.db.delete(blocks).where(inArray(blocks.id, input.ids)),
        pusherServer.trigger(
          getNoteSlug(input.projectId, input.noteId),
          "update",
          {}
        )
      ])
    })
})
