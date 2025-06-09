"use client"

import { authClient } from "@/lib/auth-client"
import type { ActiveSession, Session } from "@/server/auth"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type RevokeSessionButtonProps = {
  currentSession: Session
  session: ActiveSession
  onRevokeSession: (session: ActiveSession) => void
}

export const RevokeSessionButton: React.FC<RevokeSessionButtonProps> = ({
  currentSession,
  session,
  onRevokeSession
}) => {
  const router = useRouter()
  const [isTerminating, setIsTerminating] = useState<string>()

  return (
    <button
      className="border-muted-foreground cursor-pointer text-xs text-red-500 underline opacity-80"
      onClick={async () => {
        setIsTerminating(session.id)
        let res

        if (currentSession?.session.id === session.id) {
          res = await authClient.signOut()
        } else {
          res = await authClient.revokeSession({
            token: session.token
          })
        }

        if (res.error) {
          toast.error(res.error.message)
        } else {
          toast.success("Session terminated successfully")
          onRevokeSession(session)
        }
        router.refresh()
        setIsTerminating(undefined)
      }}
    >
      {isTerminating === session.id ? (
        <Loader2 className="size-4 animate-spin" />
      ) : session.id === currentSession?.session.id ? (
        "Sign Out"
      ) : (
        "Terminate"
      )}
    </button>
  )
}
