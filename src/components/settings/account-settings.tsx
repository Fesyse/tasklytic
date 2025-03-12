import { MobileIcon } from "@radix-ui/react-icons"
import { Laptop } from "lucide-react"
import { headers as nextHeaders } from "next/headers"
import { UAParser } from "ua-parser-js"
import { RevokeSessionButton } from "./revoke-session-button"
import { auth } from "@/server/auth"

export const AccountSettings = async () => {
  const headers = await nextHeaders()

  const [currentSession, activeSessions] = await Promise.all([
    auth.api.getSession({ headers }),
    auth.api.listSessions({
      headers
    })
  ])

  return (
    <div>
      <h2 className="text-lg font-medium mb-1">Account Settings</h2>
      <p className="text-muted-foreground max-w-lg text-sm mb-4">
        Manage your account settings, including password changes, email
        verification, and more.
      </p>
      <div className="w-max gap-1 flex flex-col">
        <h3 className="font-medium">Active Sessions</h3>
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
    </div>
  )
}
