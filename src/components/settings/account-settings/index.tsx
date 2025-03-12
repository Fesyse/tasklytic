import { MobileIcon } from "@radix-ui/react-icons"
import { Laptop } from "lucide-react"
import { headers as nextHeaders } from "next/headers"
import { notFound } from "next/navigation"
import { UAParser } from "ua-parser-js"
import { Separator } from "../../ui/separator"
import { RevokeSessionButton } from "../revoke-session-button"
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

      <section className="w-max gap-1 flex flex-col">
        <div className="flex flex-col space-y-1.5">
          <h3 className="font-semibold leading-none tracking-tight">
            Active Sessions
          </h3>
          <p className="text-sm text-muted-foreground">
            Manipulate active sessions
          </p>
        </div>
        <div className="mt-3 space-y-2">
          {activeSessions
            .filter(session => session.userAgent)
            .map(session => {
              return (
                <div key={session.id}>
                  <div className="flex items-center gap-2 text-sm  text-black font-medium dark:text-white">
                    {new UAParser(session.userAgent || "").getDevice().type ===
                    "mobile" ? (
                      <MobileIcon />
                    ) : (
                      <Laptop size={16} />
                    )}
                    {new UAParser(session.userAgent || "").getOS().name},{" "}
                    {new UAParser(session.userAgent || "").getBrowser().name}
                    <RevokeSessionButton
                      currentSession={currentSession}
                      session={session}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </section>

      <SocialLinking userAccounts={userAccounts} />
    </div>
  )
}
