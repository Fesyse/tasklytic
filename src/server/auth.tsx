import OTPEmail from "@/emails/otp-email"
import VerifyEmail from "@/emails/verify-email"
import { env } from "@/env"
import { siteConfig } from "@/lib/site-config"
import { db } from "@/server/db"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"
import { resend } from "./resend"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    autoSignIn: true
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
    sendVerificationEmail: async ({ user, url, token }) => {
      const { error } = await resend.emails.send({
        from: siteConfig.emails.noreply,
        to: user.email,
        subject: "Tasklytic - Verification Code",
        react: <VerifyEmail url={url} userName={user.name} />
      })

      if (error) {
        throw new Error(error.message)
      }
    }
  },

  plugins: [
    nextCookies(),
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
