import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { z } from "zod"

export const organizationRouter = createTRPCRouter({
  invitePeople: protectedProcedure
    .input(
      z.object({
        email: z.string().email().optional()
      })
    )
    .query(async ({ input, ctx }) => {})
})
