import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth, { type DefaultSession } from "next-auth"
import { type DefaultPostgresSchema } from "node_modules/@auth/drizzle-adapter/lib/pg"
import { authConfig } from "@/server/auth/config"
import { db } from "@/server/db"
import {
  accounts,
  sessions,
  users,
  verificationTokens
} from "@/server/db/schema"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      name: string
      email: string
      image: string | null
    }
  }
}
const adapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens
} as unknown as DefaultPostgresSchema)

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter
})
