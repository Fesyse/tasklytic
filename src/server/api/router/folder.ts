import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

export const foldersRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.folders.findMany({
        where: (foldersTable, { eq }) =>
          eq(foldersTable.projectId, input.projectId)
      })
    })
})
