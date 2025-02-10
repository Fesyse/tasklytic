import { revalidateTag } from "next/cache"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { db } from "@/server/db"
import { folders } from "@/server/db/schema"

export type GetAllFoldersResponse = {
  id: string
  name: string
  createdAt: Date | null
  updatedAt: Date | null
  emoji: string | null
  parentFolderId: string | null
  projectId: string
  notes: {
    id: string
    createdAt: Date | null
    updatedAt: Date | null
    userId: string
    emoji: string | null
    projectId: string
    title: string
    private: boolean
    isPinned: boolean
    folderId: string | null
  }[]
  subFolders: {
    id: string
    name: string
    createdAt: Date | null
    updatedAt: Date | null
    emoji: string | null
    parentFolderId: string | null
    projectId: string
  }[]
}[]

export const getWorkspace = async (data: { projectId: string }) => {
  "use cache"

  const workspace = (await db.query.folders.findMany({
    with: {
      subFolders: true,
      notes: true
    },
    where: (foldersTable, { eq, and, isNull }) =>
      and(
        eq(foldersTable.projectId, data.projectId),
        // make sure we only getting the root folders
        isNull(foldersTable.parentFolderId)
      )
  })) satisfies GetAllFoldersResponse

  cacheTag(`folders:workspace:${data.projectId}`)

  return workspace
}

export const getSubFolders = async (data: { folderId: string }) => {
  "use cache"

  const subFolders = (await db.query.folders.findMany({
    with: {
      subFolders: true,
      notes: true
    },
    where: (foldersTable, { eq, and }) =>
      and(
        eq(foldersTable.parentFolderId, data.folderId),
        // make sure we only getting the root folders
        eq(foldersTable.parentFolderId, data.folderId)
      )
  })) satisfies GetAllFoldersResponse

  cacheTag(`folders:workspace:sub-folders:${data.folderId}`)

  return subFolders
}

export const foldersRouter = createTRPCRouter({
  getWorkspace: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const workspace = await getWorkspace(input)

      return workspace
    }),
  getSubChildren: protectedProcedure
    .input(z.object({ folderId: z.string() }))
    .query(async ({ input }) => {
      const subFolders = await getSubFolders(input)

      return subFolders
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        // make folderId optional so we can create root folder
        folderId: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const folder = await ctx.db
        .insert(folders)
        .values({
          ...input,
          name: "New Folder"
        })
        .returning()
        .then(folder => folder[0])

      revalidateTag(`folders:workspace:${input.projectId}`)
      if (input.folderId)
        revalidateTag(`folders:workspace:sub-folders:${input.folderId}`)

      return folder
    })
})
