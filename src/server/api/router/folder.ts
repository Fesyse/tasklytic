import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

export const foldersRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.folders.findMany({
        with: {
          folders: true,
          notes: true
        },
        where: (foldersTable, { eq, and, isNull }) =>
          and(
            eq(foldersTable.projectId, input.projectId),
            isNull(foldersTable.folderId)
          )
      })
    })
})
