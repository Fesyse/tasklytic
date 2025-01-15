import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { folders } from "@/server/db/schema"

export type GetAllFoldersResponse = {
  id: string
  name: string
  emoji: string | null
  projectId: string
  folderId: string | null
  createdAt: Date | null
  updatedAt: Date | null

  folders: {
    projectId: string
    id: string
    name: string
    createdAt: Date | null
    updatedAt: Date | null
    emoji: string | null
    folderId: string | null
  }[]
  notes: {
    projectId: string
    id: string
    createdAt: Date | null
    updatedAt: Date | null
    userId: string
    emoji: string | null
    folderId: string | null
    title: string
    private: boolean
    isPinned: boolean
  }[]
}[]

export const foldersRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const folders = (await ctx.db.query.folders.findMany({
        with: {
          folders: true,
          notes: true
        },
        where: (foldersTable, { eq, and, isNull }) =>
          and(
            eq(foldersTable.projectId, input.projectId),
            // make sure we only getting the root folders
            isNull(foldersTable.folderId)
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
