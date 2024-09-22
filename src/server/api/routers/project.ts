import { isCuid } from "@paralleldrive/cuid2"
import { count, eq, or } from "drizzle-orm"
import { z } from "zod"
import { MAX_PROJECTS, MAX_PROJECTS_WITH_SUBSCRIPTION } from "@/lib/constants"
import { checkIsSubscriptionExpired } from "@/lib/utils"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { projects, users } from "@/server/db/schema"

export const projectsRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      if (!isCuid(input.id)) return undefined

      const project = await ctx.db.query.projects.findFirst({
        where: (projectsTable, { eq }) => eq(projectsTable.id, input.id)
      })
      return project
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.projects.findMany({
      where: (projectsTable, { eq }) =>
        or(
          eq(projectsTable.ownerId, ctx.session.user.id),
          eq(
            projects.id,
            ctx.db
              .select({ id: projects.id })
              .from(projects)
              .innerJoin(users, eq(users.id, ctx.session.user.id))
          )
        )
    })
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .max(20, { message: "Project name cannot exceed 20 characters" }),
        icon: z.string().url().optional()
      })
    )
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
          .where(eq(projects.ownerId, ctx.session.user.id))
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

      return ctx.db
        .insert(projects)
        .values({
          ...project,
          ownerId: ctx.session.user.id,
          icon: project.icon
        })
        .returning()
    })
})
