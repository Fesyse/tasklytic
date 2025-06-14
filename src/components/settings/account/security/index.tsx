import { ActiveSessions } from "@/components/settings/account/security/active-sessions"
import { SocialLinking } from "@/components/settings/account/security/social-linking"

export function SettingsAccountSecurity() {
  return (
    <div className="space-y-8">
      <ActiveSessions />

      <SocialLinking />
    </div>
  )
}
