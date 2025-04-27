import { getBaseUrl } from "@/trpc/react"
import { createAuthClient } from "better-auth/client"
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [emailOTPClient()]
})
