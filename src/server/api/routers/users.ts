import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { users } from "@/server/db/schema"
import { kv } from "@/server/kv"
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
      const cacheKey = `user:email:${input.email}`
      const cachedUser = await kv.get(cacheKey)

      if (cachedUser) {
        console.log(`[TRPC] User cache hit for email: ${input.email}`)
        return cachedUser
      }

      console.log(`[TRPC] User cache miss for email: ${input.email}`)

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

      const result = user[0] ?? null

      if (result) {
        // Cache the user data for 10 minutes (600 seconds)
        await kv.set(cacheKey, result, { ex: 600 })
      }

      return result
    })
})
