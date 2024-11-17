import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { kv } from "@/server/cache"
import { db } from "@/server/db"
import { type Block } from "@/server/db/schema"
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

      const blocks = (await db.query.blocks.findMany({
        where: (blocksTable, { and, eq }) =>
          and(eq(blocksTable.noteId, input.noteId))
      })) satisfies Block[]
      kv.set(`projects:notes:blocks:${input.noteId}`, blocks)
      kv.expire(`projects:notes:blocks:${input.noteId}`, 1800)

      return blocks
    })
})
