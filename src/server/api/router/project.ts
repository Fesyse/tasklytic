import { and, count, eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { z } from "zod"
import { isCuid } from "@/lib/utils"
import { env } from "@/env"
import { defaultWorkspace } from "@/lib/default-workspace"
import {
  createTRPCRouter,
  ProtectedCtx,
  protectedProcedure
} from "@/server/api/trpc"
import { db } from "@/server/db"
import {
  blocks,
  createCuid,
  notes,
  projectMemberships,
  projects,
  type ProjectWithMemberShip
} from "@/server/db/schema"
import { utapi } from "@/server/file-upload"
import { polar } from "@/server/polar"

const getProjectMembership = async (id: string, ctx: ProtectedCtx) => {
  "use cache"
  const projectMembership = await db.query.projectMemberships.findFirst({
    where: (projectMembershipsTable, { eq }) =>
      eq(projectMembershipsTable.projectId, id),
    with: {
      project: true
    }
  })
  cacheTag(`projects:by-id:${id}:user:${ctx.session.user.id}`)

  return projectMembership
}

const getAllProjectMemberships = async (ctx: ProtectedCtx) => {
  "use cache"

  const projectMembershipsResult = await db
    .select()
    .from(projects)
    .innerJoin(
      projectMemberships,
      eq(projectMemberships.projectId, projects.id)
    )
    .where(eq(projectMemberships.userId, ctx.session.user.id))

  cacheTag(`projects:all:user:${ctx.session.user.id}`)

  return projectMembershipsResult
}

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
    .query(async ({ ctx, input }) => {
      if (!isCuid(input.id)) return undefined

      const projectMembership = await getProjectMembership(input.id, ctx)

      return projectMembership?.project
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const response = await getAllProjectMemberships(ctx)

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

      let noteIDs: string[] = []

      await ctx.db.transaction(async trx => {
        await trx.insert(projectMemberships).values({
          projectId: createdProject.id,
          userId: ctx.session.user.id,
          role: "owner"
        })

        defaultWorkspace.notes.forEach(async defNote => {
          const note = await trx
            .insert(notes)
            .values({
              ...defNote,
              projectId: createdProject.id,
              userId: ctx.session.user.id,
              folderId: null
            })
            .returning()
            .then(r => r[0]!)

          noteIDs.push(note.id)
        })
      })

      await ctx.db.transaction(async trx => {
        defaultWorkspace.notes.forEach(async (defNote, index) => {
          defNote.blocks.forEach(async (block, order) => {
            await trx.insert(blocks).values({
              id: createCuid(),
              order,
              noteId: noteIDs[index]!,
              projectId: createdProject.id,
              content: block
            })
          })
        })
      })

      revalidateTag(`projects:all:user:${ctx.session.user.id}`)

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

      await ctx.db.transaction(async trx => {
        await trx
          .delete(projectMemberships)
          .where(eq(projectMemberships.projectId, input.id))
        await trx.delete(notes).where(eq(notes.projectId, input.id))
        await trx.delete(blocks).where(eq(blocks.projectId, input.id))
      })
      await ctx.db.delete(projects).where(eq(projects.id, input.id))

      revalidateTag(`projects:all:user:${ctx.session.user.id}`)
      revalidateTag(`projects:by-id:${input.id}:user:${ctx.session.user.id}`)
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

      const project = (await getProjectMembership(input.id, ctx))?.project

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

      revalidateTag(`projects:all:user:${ctx.session.user.id}`)
      revalidateTag(`projects:by-id:${input.id}:user:${ctx.session.user.id}`)

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
