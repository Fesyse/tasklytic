import { and, count, eq } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { tasks as tasksTable } from "@/server/db/schema"

export const taskRouter = createTRPCRouter({
  getTasks: publicProcedure
    .input(
      z.object({
        perPage: z.number(),
        page: z.number().transform(page => page - 1),
        projectId: z.string().uuid()
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session) return null
      const session = ctx.session

      const countQuery = ctx.db
        .select({
          count: count()
        })
        .from(tasksTable)
        .where(
          and(
            eq(tasksTable.userId, session.user.id),
            eq(tasksTable.projectId, input.projectId)
          )
        )

      const tasksQuery = ctx.db.query.tasks.findMany({
        where: and(
          eq(tasksTable.userId, session.user.id),
          eq(tasksTable.projectId, input.projectId)
        ),
        limit: input.perPage,
        offset: input.page * input.perPage
      })

      const result = await Promise.all([countQuery, tasksQuery])
      const tasksCount = result[0][0]!.count
      const tasks = result[1]

      return [tasksCount, tasks]
    })
})
