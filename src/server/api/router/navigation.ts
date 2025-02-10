import { z } from "zod"
import { getWorkspace } from "./folder"
import { getAllPinnedNotes, getAllRootNotes } from "./note"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

export const navigationRouter = createTRPCRouter({
  getSidebar: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const pinnedNotesPromise = getAllPinnedNotes(input, ctx)
      const workspacePromise = getWorkspace(input)
      const rootNotesPromise = getAllRootNotes(input, ctx)

      const [pinnedNotes, workspace, rootNotes] = await Promise.all([
        pinnedNotesPromise,
        workspacePromise,
        rootNotesPromise
      ])

      return {
        pinnedNotes,
        workspace,
        rootNotes
      }
    })
})
