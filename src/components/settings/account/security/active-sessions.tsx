"use client"

import { RevokeSessionButton } from "@/components/settings/account/security/revoke-session-button"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { getRandomInt } from "@/lib/utils"
import type { ActiveSession } from "@/server/auth"
import { MobileIcon } from "@radix-ui/react-icons"
import { Laptop } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { UAParser } from "ua-parser-js"

export const ActiveSessions = () => {
  const t = useTranslations(
    "Dashboard.Settings.tabs.accountGroup.security.ActiveSessions"
  )
  const { data: currentSession } = authClient.useSession()
  const { data: initialActiveSessions, isPending: isActiveSessionsLoading } =
    authClient.useListSessions()

  const [activeSessions, setActiveSessions] = useState<ActiveSession[] | null>(
    initialActiveSessions
  )

  useEffect(() => {
    if (initialActiveSessions) setActiveSessions(initialActiveSessions)
  }, [initialActiveSessions])

  return (
    <section className="flex w-max flex-col gap-1">
      <div className="flex flex-col space-y-1.5">
        <h3 className="leading-none font-semibold tracking-tight">
          {t("title")}
        </h3>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
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
                      {currentSession?.session.id === session.id && (
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({t("currentSession")})
                        </span>
                      )}
                      <RevokeSessionButton
                        currentSession={currentSession}
                        session={session}
                        onRevokeSession={(revokedSession) =>
                          setActiveSessions((prev) => {
                            if (!prev) return null

                            return prev.filter(
                              (session) => session.id !== revokedSession.id
                            )
                          })
                        }
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
