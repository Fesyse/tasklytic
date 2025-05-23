import { getBaseUrl } from "@/lib/utils"
import { profileImageClient } from "@better-auth-kit/profile-image"
import { organizationClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: `${getBaseUrl()}/api/auth`,
  plugins: [organizationClient(), profileImageClient()]
})
