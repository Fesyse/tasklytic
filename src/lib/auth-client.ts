import { getBaseUrl } from "@/trpc/react"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: []
})
