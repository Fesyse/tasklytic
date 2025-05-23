import InviteToOrganizationEmail from "@/emails/invite-to-organization-email"
import ResetPasswordEmail from "@/emails/reset-password-email"
import VerifyEmail from "@/emails/verify-email"
import { env } from "@/env"
import { siteConfig } from "@/lib/site-config"
import { getBaseUrl } from "@/lib/utils"
import { db } from "@/server/db"
import { resend } from "@/server/resend"
import {
  profileImage,
  UploadThingProvider
} from "@better-auth-kit/profile-image"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { organization } from "better-auth/plugins/organization"
import { utApi } from "./uploadthing"

// FIXME: Versions seem to be incompatible
const provider = new UploadThingProvider(utApi as any)

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
          react: <VerifyEmail url={url} userName={user.name} />
        })

        if (error) {
          throw new Error(error.message)
        }
      }
    }
  },
  session: {
    modelName: "sessions"
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
      const { error } = await resend.emails.send({
        from: siteConfig.emails.noreply,
        to: user.email,
        subject: "Verify your email | Sign Up - Tasklytic",
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
    }),
    profileImage({ storageProvider: provider })
  ]
})
