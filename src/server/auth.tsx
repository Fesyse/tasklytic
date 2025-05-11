import ResetPasswordEmail from "@/emails/reset-password-email"
import VerifyEmail from "@/emails/verify-email"
import { env } from "@/env"
import { siteConfig } from "@/lib/site-config"
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
    modelName: "users"
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
