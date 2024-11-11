import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { type Note } from "@/server/db/schema"
import { z } from "zod"

export const notesRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const result: Note[] = await ctx.db.query.notes.findMany({
        where: (notesTable, { and, not, eq }) =>
          and(
            eq(notesTable.id, input.id),
            not(eq(notesTable.private, true)),
            not(eq(notesTable.userId, ctx.session.user.id))
          )
      })

      return result[0]
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string()
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

      return result
    }),

  getAllPinned: protectedProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const result: Note[] = await ctx.db.query.notes.findMany({
        where: (notesTable, { and, not, eq }) =>
          and(
            eq(notesTable.projectId, input.projectId),
            eq(notesTable.isPinned, true),
            and(
              not(eq(notesTable.private, true)),
              not(eq(notesTable.userId, ctx.session.user.id))
            )
          )
      })

      return result
    })
})
