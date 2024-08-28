import { count } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { tasks as tasksTable } from "@/server/db/schema"

export const taskRouter = createTRPCRouter({
  getTasks: publicProcedure
    .input(
      z.object({
        perPage: z.number(),
        page: z.number().transform(page => page - 1)
      })
    )
    .query(({ input, ctx }) => {
      if (ctx.session) {
        const session = ctx.session

        const countResult = ctx.db
          .select({
            count: count()
          })
          .from(tasksTable)
        const tasks = ctx.db.query.tasks.findMany({
          where: (tasks, { eq }) => eq(tasks.userId, session.user.id),
          limit: input.perPage,
          offset: input.page * input.perPage
        })

        return Promise.all([countResult, tasks])
      } else {
        return null
      }
    })
})
