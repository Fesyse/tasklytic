import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { users } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

export const userRouter = createTRPCRouter({
  searchMany: protectedProcedure
    .input(
      z.object({
        email: z.string().email().optional()
      })
    )
    .query(async ({ input, ctx }) => {
      const usersResult = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image
        })
        .from(users)
        .where(input.email ? eq(users.email, input.email) : undefined)

      return usersResult
    })
})
