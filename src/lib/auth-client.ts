import { getBaseUrl } from "@/trpc/react"
import { emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [emailOTPClient()]
})
