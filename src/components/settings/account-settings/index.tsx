import { headers as nextHeaders } from "next/headers"
import { notFound } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { ActiveSessions } from "./active-sessions"
import { SocialLinking } from "./social-linking"
import { auth } from "@/server/auth"

export const AccountSettings = async () => {
  const headers = await nextHeaders()

  const [currentSession, activeSessions, userAccounts] = await Promise.all([
    auth.api.getSession({ headers }),
    auth.api.listSessions({
      headers
    }),
    auth.api.listUserAccounts({ headers })
  ])

  if (!currentSession) return notFound()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and connected social accounts
        </p>
      </div>
      <Separator className="!mt-4" />

      <ActiveSessions
        currentSession={currentSession}
        activeSessions={activeSessions}
      />

      <SocialLinking session={currentSession} userAccounts={userAccounts} />
    </div>
  )
}
