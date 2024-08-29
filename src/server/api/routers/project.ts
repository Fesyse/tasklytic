import { createProjectSchema } from "@/lib/schemas"
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from "@/server/api/trpc"
import { projects } from "@/server/db/schema"

export const projectRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    if (!ctx.session) return null
    const session = ctx.session

    return ctx.db.query.projects.findMany({
      where: (projectsTable, { eq }) =>
        eq(projectsTable.userId, session.user.id)
    })
  }),
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ input: project, ctx }) => {
      return ctx.db
        .insert(projects)
        .values({ ...project, userId: ctx.session.user.id })
        .returning()
    })
})
