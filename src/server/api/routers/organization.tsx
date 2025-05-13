import InviteToOrganizationEmail from "@/emails/invite-to-organization-email"
import { siteConfig } from "@/lib/site-config"
import { tryCatch } from "@/lib/utils"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { auth } from "@/server/auth"
import { resend } from "@/server/resend"
import { headers } from "next/headers"
import { z } from "zod"

export const organizationRouter = createTRPCRouter({
  invitePeople: protectedProcedure
    .input(
      z.object({
        invitations: z.array(
          z.object({
            email: z.string(),
            userId: z.string().optional()
          })
        )
      })
    )
    .mutation(async ({ input, ctx }) => {
      const activeOrganization = await auth.api.getFullOrganization({
        headers: await headers()
      })

      if (!activeOrganization) {
        throw new Error(
          "An error occured, while getting current organization, please try again later."
        )
      }

      const invitationPromises = input.invitations.map((invitation) => {
        if (invitation?.userId) {
          const invitationPromise = auth.api.addMember({
            body: {
              userId: invitation.userId,
              role: "member",
              organizationId: activeOrganization.id
            }
          })

          return invitationPromise
        } else {
          // ctx.db.insert(invitations).values({
          //   id: `new-user-${createId()}`,
          //   inviterId: ctx.session.user.id,
          //   organizationId: activeOrganization.id,
          //   status: "",
          //   email: invitation.email,
          //   expiresAt: addDays(new Date(), 2)
          // })

          const invitationPromise = resend.emails.send({
            from: siteConfig.emails.noreply,
            to: invitation.email,
            subject: `You've been invited to join ${activeOrganization.name}`,
            react: (
              <InviteToOrganizationEmail
                inviteExpiryDays={2}
                inviterName={ctx.session.user.name}
                organizationName={activeOrganization.name}
              />
            )
          })

          return invitationPromise
        }
      })

      const { data: result, error: resultError } = await tryCatch(
        Promise.allSettled(invitationPromises)
      )

      if (resultError) {
        throw new Error(auth.$ERROR_CODES.FAILED_TO_RETRIEVE_INVITATION)
      }
      const errors = result.map((val) => {
        if (val.status === "rejected") return val.reason.body.message as string
        if (!val.value) return auth.$ERROR_CODES.FAILED_TO_RETRIEVE_INVITATION
        if ("error" in val.value && val.value.error)
          return val.value.error.message
      })

      if (errors.length) {
        throw new Error(
          errors
            .map((error, i) =>
              error
                ? `Failed to invite "${input.invitations[i]?.email}", reason: ${error}`
                : ""
            )
            .join(",\n")
        )
      }

      return result
        .filter((res) => res.status === "fulfilled")
        .map((res) => res.value)
    })
})
