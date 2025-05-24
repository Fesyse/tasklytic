import { auth } from "@/server/auth"
import { headers as nextHeaders } from "next/headers"
import { redirect } from "next/navigation"
import { ActiveSessions } from "./active-sessions"
import { SocialLinking } from "./social-linking"

export async function SettingsSecurity() {
  const headers = await nextHeaders()

  const [currentSession, activeSessions, userAccounts] = await Promise.all([
    auth.api.getSession({ headers }),
    auth.api.listSessions({
      headers
    }),
    auth.api.listUserAccounts({ headers })
  ])

  if (!currentSession) redirect("/auth/sign-in")

  return (
    <div className="space-y-8">
      <ActiveSessions
        currentSession={currentSession}
        activeSessions={activeSessions}
      />

      <SocialLinking session={currentSession} userAccounts={userAccounts} />
    </div>
  )
}
