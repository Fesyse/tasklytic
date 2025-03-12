"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { authClient } from "@/lib/auth"
import type { ActiveSession, Session } from "@/server/auth"

type RevokeSessionButtonProps = {
  currentSession: Session
  session: ActiveSession
}

export const RevokeSessionButton: React.FC<RevokeSessionButtonProps> = ({
  currentSession,
  session
}) => {
  const router = useRouter()
  const [isTerminating, setIsTerminating] = useState<string>()

  return (
    <button
      className="text-red-500 opacity-80  cursor-pointer text-xs border-muted-foreground border-red-600  underline "
      onClick={async () => {
        setIsTerminating(session.id)
        const res = await authClient.revokeSession({
          token: session.token
        })

        if (res.error) {
          toast.error(res.error.message)
        } else {
          toast.success("Session terminated successfully")
        }
        router.refresh()
        setIsTerminating(undefined)
      }}
    >
      {isTerminating === session.id ? (
        <LoadingSpinner size={15} />
      ) : session.id === currentSession?.session.id ? (
        "Sign Out"
      ) : (
        "Terminate"
      )}
    </button>
  )
}
