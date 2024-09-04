import { toast } from "sonner"
import { createProjectSchema } from "@/lib/schemas"
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from "@/server/api/trpc"
import { projects } from "@/server/db/schema"
import { utapi } from "@/server/file-upload"

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
      let icon = null
      if (project.icon) {
        icon = await utapi.uploadFiles(project.icon)
        if (icon?.error)
          return toast.error("An error occured trying to upload image!")
      }

      return ctx.db
        .insert(projects)
        .values({
          ...project,
          userId: ctx.session.user.id,
          icon: icon?.data.url
        })
        .returning()
    })
})
