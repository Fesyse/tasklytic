import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { invitations, organizations, users } from "@/server/db/schema"
import { kv } from "@/server/kv"
import { and, eq } from "drizzle-orm"

export const organizationRouter = createTRPCRouter({
  getInvitations: protectedProcedure.query(async ({ ctx }) => {
    const cacheKey = `user:${ctx.session.user.email}:invitations`
    const cachedInvitations = await kv.get(cacheKey)

    if (cachedInvitations) {
      console.log(
        `[TRPC] Invitations cache hit for user: ${ctx.session.user.email}`
      )
      return cachedInvitations
    }

    console.log(
      `[TRPC] Invitations cache miss for user: ${ctx.session.user.email}`
    )

    const invitationsResult = await ctx.db
      .select({
        id: invitations.id,
        email: invitations.email,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
        organizationId: invitations.organizationId,
        role: invitations.role,
        inviterId: invitations.inviterId,
        organizationName: organizations.name,
        inviterEmail: users.email
      })
      .from(invitations)
      .innerJoin(
        organizations,
        eq(invitations.organizationId, organizations.id)
      )
      .innerJoin(users, eq(invitations.inviterId, users.id))
      .where(
        and(
          eq(invitations.email, ctx.session.user.email),
          eq(invitations.status, "pending")
        )
      )

    // Cache the invitations for 5 minutes (300 seconds)
    await kv.set(cacheKey, invitationsResult, { ex: 300 })

    return invitationsResult
  })
})
