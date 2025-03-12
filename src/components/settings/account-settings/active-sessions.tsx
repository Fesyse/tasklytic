import { MobileIcon } from "@radix-ui/react-icons"
import { Laptop } from "lucide-react"
import { UAParser } from "ua-parser-js"
import { RevokeSessionButton } from "@/components/settings/account-settings/revoke-session-button"
import type { ActiveSession, Session } from "@/server/auth"

type ActiveSessionsProps = {
  currentSession: Session
  activeSessions: ActiveSession[]
}

export const ActiveSessions: React.FC<ActiveSessionsProps> = ({
  currentSession,
  activeSessions
}) => {
  return (
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
  )
}
