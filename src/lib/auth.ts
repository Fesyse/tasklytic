import { createAuthClient } from "better-auth/react"
import { env } from "@/env"

const authClient = createAuthClient({
  baseURL: env.BETTER_AUTH_URL // Optional if the API base URL matches the frontend
})

export const { signIn, signOut, useSession } = authClient
