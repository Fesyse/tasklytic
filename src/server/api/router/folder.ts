import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
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

export const foldersRouter = createTRPCRouter({
  getWorkspace: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const folders = (await ctx.db.query.folders.findMany({
        with: {
          subFolders: true,
          notes: true
        },
        where: (foldersTable, { eq, and, isNull }) =>
          and(
            eq(foldersTable.projectId, input.projectId),
            // make sure we only getting the root folders
            isNull(foldersTable.parentFolderId)
          )
      })) satisfies GetAllFoldersResponse

      return folders
    }),
  getSubChildren: protectedProcedure
    .input(z.object({ folderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const folders = (await ctx.db.query.folders.findMany({
        with: {
          subFolders: true,
          notes: true
        },
        where: (foldersTable, { eq, and }) =>
          and(
            eq(foldersTable.parentFolderId, input.folderId),
            // make sure we only getting the root folders
            eq(foldersTable.parentFolderId, input.folderId)
          )
      })) satisfies GetAllFoldersResponse
      return folders
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

      return folder
    })
})
