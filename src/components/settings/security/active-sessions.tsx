import { RevokeSessionButton } from "@/components/settings/security/revoke-session-button"
import type { ActiveSession, Session } from "@/server/auth"
import { MobileIcon } from "@radix-ui/react-icons"
import { Laptop } from "lucide-react"
import { UAParser } from "ua-parser-js"

type ActiveSessionsProps = {
  currentSession: Session
  activeSessions: ActiveSession[]
}

export const ActiveSessions: React.FC<ActiveSessionsProps> = ({
  currentSession,
  activeSessions
}) => {
  return (
    <section className="flex w-max flex-col gap-1">
      <div className="flex flex-col space-y-1.5">
        <h3 className="leading-none font-semibold tracking-tight">
          Active Sessions
        </h3>
        <p className="text-muted-foreground text-sm">
          Manipulate active sessions
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {activeSessions
          .filter((session) => session.userAgent)
          .map((session) => {
            return (
              <div key={session.id}>
                <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
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
