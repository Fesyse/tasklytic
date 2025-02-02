import { and, count, eq } from "drizzle-orm"
import { z } from "zod"
import { isCuid } from "@/lib/utils"
import { env } from "@/env"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { kv } from "@/server/cache"
import {
  type Project,
  projectMemberships,
  projects,
  type ProjectWithMemberShip
} from "@/server/db/schema"
import { utapi } from "@/server/file-upload"
import { polar } from "@/server/polar"

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

      const cached = await kv.get(`projects:${input.id}`)
      if (cached) return cached as Project

      const projectMembership = await ctx.db.query.projectMemberships.findFirst(
        {
          where: (projectMembershipsTable, { eq }) =>
            and(
              eq(projectMemberships.userId, ctx.session.user.id),
              eq(projectMembershipsTable.projectId, input.id)
            ),
          with: {
            project: true
          }
        }
      )

      kv.set(`projects:${input.id}`, projectMembership?.project)
      kv.expire(`projects:${input.id}`, 6400)

      return projectMembership?.project
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // const cached = await kv.get(`projects:all`)
    // if (cached) return cached as Project[]

    const response = await ctx.db
      .select()
      .from(projects)
      .innerJoin(
        projectMemberships,
        eq(projectMemberships.projectId, projects.id)
      )
      .where(eq(projectMemberships.userId, ctx.session.user.id))

    return response.map<ProjectWithMemberShip>(r => ({
      ...r.project,
      membership: r.project_membership
    }))
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
      const [[projectsCount], subscription] = await Promise.all([
        ctx.db
          .select({
            count: count()
          })
          .from(projectMemberships)
          .where(
            and(
              eq(projectMemberships.role, "owner"),
              eq(projectMemberships.userId, ctx.session.user.id)
            )
          ),
        ctx.session.user.customerId
          ? polar.subscriptions.get({ id: ctx.session.user.customerId })
          : null
      ])

      if (
        subscription?.product.name === "Pro" &&
        // If MAX_PROJECTS_WITH_PRO_PLAN is -1, then it is unlimited
        env.MAX_PROJECTS_WITH_PRO_PLAN !== -1 &&
        (projectsCount?.count ?? 0) >= env.MAX_PROJECTS_WITH_PRO_PLAN
      ) {
        throw new Error(
          `Max limit of ${env.MAX_PROJECTS_WITH_PRO_PLAN} reached.`
        )
      } else if (
        !subscription &&
        // If MAX_PROJECTS_WITH_FREE_PLAN is -1, then it is unlimited
        env.MAX_PROJECTS_WITH_FREE_PLAN !== -1 &&
        (projectsCount?.count ?? 0) >= env.MAX_PROJECTS_WITH_FREE_PLAN
      ) {
        throw new Error(
          `Max limit of ${env.MAX_PROJECTS_WITH_FREE_PLAN} reached.`
        )
      } else if (
        subscription?.product.name === "Enterprise" &&
        // If MAX_PROJECTS_WITH_ENTERPRISE_PLAN is -1, then it is unlimited
        env.MAX_PROJECTS_WITH_ENTERPRISE_PLAN !== -1 &&
        (projectsCount?.count ?? 0) >= env.MAX_PROJECTS_WITH_ENTERPRISE_PLAN
      ) {
        throw new Error(
          `Max limit of ${env.MAX_PROJECTS_WITH_ENTERPRISE_PLAN} reached.`
        )
      }

      const createdProject = await ctx.db
        .insert(projects)
        .values({
          ...project,
          icon: project.icon
        })
        .returning()
        .then(r => r[0]!)

      await ctx.db.insert(projectMemberships).values({
        projectId: createdProject.id,
        userId: ctx.session.user.id,
        role: "owner"
      })

      return createdProject
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
