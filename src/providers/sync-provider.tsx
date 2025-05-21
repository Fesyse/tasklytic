"use client"

import type { ReactNode } from "react"

import { SyncProvider as SyncContextProvider } from "@/contexts/sync-context"

/**
 * Database synchronization provider that connects Dexie client DB with server Drizzle DB
 * Wrap your application with this provider to enable automatic sync capabilities
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  return <SyncContextProvider>{children}</SyncContextProvider>
}
