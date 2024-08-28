import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

export const projectRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    if (!ctx.session) return null
    const session = ctx.session

    return ctx.db.query.projects.findMany({
      where: (projectsTable, { eq }) =>
        eq(projectsTable.userId, session.user.id)
    })
  })
})
