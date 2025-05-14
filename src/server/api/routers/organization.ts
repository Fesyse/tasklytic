import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { invitations, organizations, users } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"

export const organizationRouter = createTRPCRouter({
  getInvitations: protectedProcedure.query(async ({ ctx }) => {
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

    return invitationsResult
  })
})
