import { MobileIcon } from "@radix-ui/react-icons"
import { Laptop } from "lucide-react"
import { headers } from "next/headers"
import { UAParser } from "ua-parser-js"
import { RevokeSessionButton } from "./revoke-session-button"
import { auth } from "@/server/auth"

export const AccountSettings = async () => {
  const [currentSession, activeSessions] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    auth.api.listSessions({
      headers: await headers()
    })
  ])

  return (
    <div>
      <div className="border-l-2 px-2 w-max gap-1 flex flex-col">
        <p className="text-xs font-medium ">Active Sessions</p>
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
