import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { type Note } from "@/server/db/schema"

export const notesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().cuid()
      })
    )
    .query(async ({ ctx, input }) => {
      const result: Note[] = await ctx.db.query.notes.findMany({
        where: (notesTable, { and, not, eq }) =>
          and(
            eq(notesTable.projectId, input.projectId),
            and(
              not(eq(notesTable.private, true)),
              not(eq(notesTable.userId, ctx.session.user.id))
            )
          )
      })

      console.log(true)

      return result
    })
})
