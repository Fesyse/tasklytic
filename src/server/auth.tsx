import OTPEmail from "@/emails/otp-email"
import VerifyEmail from "@/emails/verify-email"
import { env } from "@/env"
import { siteConfig } from "@/lib/site-config"
import { db } from "@/server/db"
import { resend } from "@/server/resend"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { emailOTP, organization } from "better-auth/plugins"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    autoSignIn: true,
    autoSignInAfterVerification: true
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
        subject: "Sign Up - Verify your email",
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
    }),
    emailOTP({
      allowedAttempts: 5,
      async sendVerificationOTP({ email, otp }) {
        const { error } = await resend.emails.send({
          from: siteConfig.emails.noreply,
          to: email,
          subject: "Tasklytic - Verification Code",
          react: <OTPEmail otp={otp} />
        })

        if (error) {
          throw new Error(error.message)
        }
      }
    })
  ]
})
