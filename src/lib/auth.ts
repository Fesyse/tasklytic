import { createAuthClient } from "better-auth/react"
import { getBaseUrl } from "@/trpc/react"

const authClient = createAuthClient({
  baseURL: getBaseUrl()
})

export const { signIn, signOut, useSession } = authClient
