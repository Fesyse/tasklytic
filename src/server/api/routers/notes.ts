import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { type Note } from "@/server/db/schema"

export const notesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().cuid()
      })
    )
    .query(() => {
      return [] as Note[]
    })
})
