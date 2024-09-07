import { z } from "zod"
import { createProjectSchema } from "@/lib/schemas"
import { isUUID } from "@/lib/utils"
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from "@/server/api/trpc"
import { projects } from "@/server/db/schema"
import { utapi } from "@/server/file-upload"

export const projectRouter = createTRPCRouter({
  getById: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(({ input, ctx }) => {
      if (!ctx.session || !isUUID.safeParse(input.id).success) return null

      return ctx.db.query.projects.findFirst({
        where: (projectsTable, { eq }) => eq(projectsTable.id, input.id)
      })
    }),
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
      let icon = null
      if (project.icon) {
        const result = await utapi.uploadFiles(project.icon)
        if (result?.error)
          throw new Error("An error occured trying to upload image!")
        icon = result.data.url
      }

      return ctx.db
        .insert(projects)
        .values({
          ...project,
          userId: ctx.session.user.id,
          icon
        })
        .returning()
    })
})
