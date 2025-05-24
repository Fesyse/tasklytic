import { ActiveSessions } from "./active-sessions"
import { SocialLinking } from "./social-linking"

export function SettingsSecurity() {
  return (
    <div className="space-y-8">
      <ActiveSessions />

      <SocialLinking />
    </div>
  )
}
