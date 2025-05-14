import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { users } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

export const userRouter = createTRPCRouter({
  getByEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email()
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image
        })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1)

      return user[0] || null
    })
})
