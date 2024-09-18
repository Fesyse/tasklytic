// TODO: setup this with notes
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

export const taskRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        perPage: z.number(),
        page: z.number().transform(page => page - 1),
        projectId: z.string().uuid()
      })
    )
    .query(() => {
      // const countQuery = ctx.db
      //   .select({
      //     count: count()
      //   })
      //   .from(tasksTable)
      //   .where(eq(tasksTable.projectId, input.projectId))
      // const tasksQuery = ctx.db.query.tasks.findMany({
      //   where: eq(tasksTable.projectId, input.projectId),
      //   limit: input.perPage,
      //   offset: input.page * input.perPage
      // })
      // const result = await Promise.all([countQuery, tasksQuery])
      // const tasksCount = result[0][0]!.count
      // const tasks = result[1]
      // return [tasksCount, tasks]
    })
})
