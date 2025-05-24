"use client"

import { RevokeSessionButton } from "@/components/settings/security/revoke-session-button"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { getRandomInt } from "@/lib/utils"
import { MobileIcon } from "@radix-ui/react-icons"
import { Laptop } from "lucide-react"
import { UAParser } from "ua-parser-js"

export const ActiveSessions = () => {
  const { data: currentSession } = authClient.useSession()
  const { data: activeSessions, isPending: isActiveSessionsLoading } =
    authClient.useListSessions()

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
        {isActiveSessionsLoading || !activeSessions
          ? Array.from({ length: 3 }).map((_, index) => (
              <ActiveSessionSkeleton key={index} />
            ))
          : activeSessions
              .filter((session) => session.userAgent)
              .map((session) => {
                return (
                  <div key={session.id}>
                    <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                      {new UAParser(session.userAgent || "").getDevice()
                        .type === "mobile" ? (
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

function ActiveSessionSkeleton() {
  const width = getRandomInt(24 * 3.5, 24 * 5)

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4" style={{ width }} />
      <Skeleton className="h-4 w-12" variant="destructive" />
    </div>
  )
}
