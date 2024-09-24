import { isCuid } from "@paralleldrive/cuid2"
import { count, eq, or } from "drizzle-orm"
import { z } from "zod"
import { MAX_PROJECTS, MAX_PROJECTS_WITH_SUBSCRIPTION } from "@/lib/constants"
import { checkIsSubscriptionExpired } from "@/lib/utils"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { projects, users } from "@/server/db/schema"
import { utapi } from "@/server/file-upload"

const deleteIcon = async (fileKey: string) => {
  const response = await utapi.deleteFiles(fileKey)
  if (!response.success)
    throw new Error("An error occured tried to delete icon.")

  return response
}

type Icon =
  | {
      update: boolean
      url: string
    }
  | {
      delete: boolean
    }

const deleteOrUpdateIcon = async (icon: Icon, projectIcon: string | null) => {
  const splittedIcon = (projectIcon ?? "").split("/")
  const fileKey = splittedIcon[splittedIcon.length - 1]

  if ("delete" in icon) {
    if (!fileKey) throw new Error("Icon file key not found.")
    return deleteIcon(fileKey)
  }
  if (projectIcon && fileKey) return deleteIcon(fileKey)
}

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
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!isCuid(input.id)) return undefined
      return ctx.db.delete(projects).where(eq(projects.id, input.id))
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string()
          .max(20, { message: "Project name cannot exceed 20 characters" })
          .optional(),
        icon: z
          .object({
            update: z.boolean(),
            url: z.string()
          })
          .or(z.object({ delete: z.boolean() }))
          .optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!isCuid(input.id)) return
      if (!input.name && !input.icon) return

      const project = await ctx.db.query.projects.findFirst({
        where: (projectsTable, { eq }) => eq(projectsTable.id, input.id)
      })

      if (!project) throw new Error("Project not found.")

      let icon: string | null = null
      if (input.icon) {
        const response = await deleteOrUpdateIcon(input.icon, project.icon)
        if (!response?.success)
          throw new Error(
            `An error occured tried to ${"delete" in input.icon ? "delete" : "update"} icon.`
          )
        if ("update" in input.icon) icon = input.icon.url
      }

      return ctx.db
        .update(projects)
        .set({
          ...input,
          icon
        })
        .where(eq(projects.id, input.id))
        .returning()
    })
})
