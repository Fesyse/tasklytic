"use client"

import { api } from "@/trpc/react"
import { useEffect } from "react"

/**
 * A hook that provides real-time count of pending organization invitations
 * for the current user.
 */
export function useInvitationCount(refreshInterval = 30000) {
  const { data: invitations, refetch } =
    api.organization.getInvitations.useQuery(undefined, {
      refetchOnWindowFocus: false,
      staleTime: refreshInterval
    })

  // Set up periodic refresh interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch()
    }, refreshInterval)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [refetch, refreshInterval])

  return invitations?.length ?? 0
}
