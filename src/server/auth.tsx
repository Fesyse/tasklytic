import InviteToOrganizationEmail from "$/invite-to-organization-email"
import ResetPasswordEmail from "$/reset-password-email"
import VerifyEmail from "$/verify-email"
import { env } from "@/env"
import { siteConfig } from "@/lib/site-config"
import { getBaseUrl } from "@/lib/utils"
import { db } from "@/server/db"
import { resend } from "@/server/resend"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { organization } from "better-auth/plugins/organization"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    autoSignIn: true,
    autoSignInAfterVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const { error } = await resend.emails.send({
        from: siteConfig.emails.noreply,
        to: user.email,
        subject: "Reset your password - Tasklytic",
        react: <ResetPasswordEmail url={url} userName={user.name} />
      })

      if (error) {
        throw new Error(error.message)
      }
    }
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    }
  },
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  user: {
    modelName: "users",
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        const { error } = await resend.emails.send({
          from: siteConfig.emails.noreply,
          to: newEmail,
          subject: "Verify your email | Change email - Tasklytic",
          react: (
            <VerifyEmail type="change-email" url={url} userName={user.name} />
          )
        })

        if (error) {
          throw new Error(error.message)
        }
      }
    }
  },
  session: {
    modelName: "sessions",
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds
    }
  },
  account: {
    modelName: "accounts"
  },
  verification: {
    modelName: "verification"
  },

  emailVerification: {
    expiresIn: 60 * 15,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const subject = "Verify your email | Sign Up - Tasklytic"
      const { error } = await resend.emails.send({
        from: siteConfig.emails.noreply,
        to: user.email,
        subject,
        react: <VerifyEmail url={url} userName={user.name} />
      })

      if (error) {
        throw new Error(error.message)
      }
    }
  },

  plugins: [
    nextCookies(),
    organization({
      sendInvitationEmail: async ({ id, email, inviter, organization }) => {
        const recipient = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, email)
        })

        const url = `${getBaseUrl()}${recipient ? `/accept-invitation?id=${id}` : `/auth/sign-up?invitationId=${id}`}`

        const { error } = await resend.emails.send({
          from: siteConfig.emails.noreply,
          to: email,
          subject: `You've been invited to join ${organization.name}`,
          react: (
            <InviteToOrganizationEmail
              url={url}
              inviteExpiryDays={2}
              inviterName={inviter.user.name}
              recipientName={recipient ? recipient.name : undefined}
              organizationName={organization.name}
            />
          )
        })
        if (error) {
          throw new Error(auth.$ERROR_CODES.FAILED_TO_RETRIEVE_INVITATION)
        }
      },
      schema: {
        organization: {
          modelName: "organizations"
        },
        member: {
          modelName: "members"
        },
        invitation: {
          modelName: "invitations"
        }
      }
    })
  ]
})

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>
export type ActiveSession = Awaited<
  ReturnType<typeof auth.api.listSessions>
>[number]
export type UserAccount = Awaited<
  ReturnType<typeof auth.api.listUserAccounts>
>[number]
