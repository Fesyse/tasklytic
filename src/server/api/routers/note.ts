import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { notes, type Note } from "@/server/db/schema"
import { eq, or } from "drizzle-orm"
import { z } from "zod"

export const notesRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
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

      return result
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

      return result
    }),
  getAllUnpinned: protectedProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
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

      return result
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(notes)
        .values({
          projectId: input.projectId,
          userId: ctx.session.user.id,
          isPinned: false
        })
        .returning()
        .then(r => r[0]!)

      return result
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().max(20).optional(),
        private: z.boolean().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(notes)
        .set({
          title: input.title,
          private: input.private
        })
        .where(eq(notes.id, input.id))
        .returning()
        .then(r => r[0]!)

      return result
    })
})
