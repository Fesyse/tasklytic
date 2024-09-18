import { isCuid } from "@paralleldrive/cuid2"
import { count, eq } from "drizzle-orm"
import { z } from "zod"
import { MAX_PROJECTS, MAX_PROJECTS_WITH_SUBSCRIPTION } from "@/lib/constants"
import { createProjectSchema } from "@/lib/schemas"
import { checkIsSubscriptionExpired } from "@/lib/utils"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { projects } from "@/server/db/schema"
import { utapi } from "@/server/file-upload"

export const projectsRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        with: z
          .object({
            notes: z.boolean().optional()
          })
          .default({})
      })
    )
    .query(async ({ input, ctx }) => {
      if (!isCuid(input.id)) return undefined
      const _with = input.with as Record<keyof typeof input.with, true>

      const task = await ctx.db.query.projects.findFirst({
        where: (projectsTable, { eq }) => eq(projectsTable.id, input.id),
        with: _with
      })
      return task
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.projects.findMany({
      where: (projectsTable, { eq }) =>
        eq(projectsTable.userId, ctx.session.user.id)
    })
  }),
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ input: project, ctx }) => {
      const [user, [projectsCount]] = await Promise.all([
        ctx.db.query.users.findFirst({
          where: (usersTable, { eq }) => eq(usersTable.id, ctx.session.user.id)
        }),
        ctx.db
          .select({
            count: count()
          })
          .from(projects)
          .where(eq(projects.userId, ctx.session.user.id))
      ])
      const isSubscriptionExpired =
        !user?.subscriptionEndDate ||
        checkIsSubscriptionExpired(user?.subscriptionEndDate ?? new Date())

      if (isSubscriptionExpired && (projectsCount?.count ?? 0) >= MAX_PROJECTS)
        throw new Error(
          `Max limit of ${MAX_PROJECTS} reached without subscription.`
        )
      if ((projectsCount?.count ?? 0) >= MAX_PROJECTS_WITH_SUBSCRIPTION)
        throw new Error(
          `Max limit of ${MAX_PROJECTS_WITH_SUBSCRIPTION} reached.`
        )

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
