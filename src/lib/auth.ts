import { createAuthClient } from "better-auth/react"
import { getBaseUrl } from "@/trpc/react"

export const authClient = createAuthClient({
  baseURL: getBaseUrl()
})

export const { signIn, signOut, useSession } = authClient
