import { getBaseUrl } from "@/lib/utils"
import { organizationClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: `${getBaseUrl()}/api/auth`,
  plugins: [organizationClient()]
})
