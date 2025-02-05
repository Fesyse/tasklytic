import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { db } from "./db"
import { env } from "@/env"
import * as schema from "@/server/db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verification
    }
  }),

  socialProviders: {
    google: {
      enabled: true,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    },
    github: {
      enabled: true,
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    },
    discord: {
      enabled: true,
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET
    }
  },

  user: {
    additionalFields: {
      customerId: {
        type: "string",
        required: false,
        unique: true,
        input: false
      },
      subscriptionId: {
        type: "string",
        required: false,
        unique: true,
        input: false
      },
      plan: {
        type: "string",
        required: true,
        unique: false,
        input: false,
        default: "Free"
      }
    }
  },

  // Plugins
  plugins: [nextCookies()]
})

export type Session = typeof auth.$Infer.Session
