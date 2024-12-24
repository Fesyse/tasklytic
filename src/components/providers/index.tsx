"use client"

import { SpeedInsights } from "@vercel/speed-insights/next"
import { SessionProvider, useSession } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"
import { isNotePage } from "@/lib/utils"
import { NoteEditorStateProvider } from "./note-editor-state-provider"
import { UserSettingsStoreProvider } from "./user-settings-store-provider"
import { PusherProvider } from "@/lib/pusher"
import { TRPCReactProvider } from "@/trpc/react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function Providers({ children }: React.PropsWithChildren) {
  const pathname = usePathname()
  const session = useSession()
  const isNote = isNotePage(pathname)

  return (
    <TRPCReactProvider>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserSettingsStoreProvider>
            <NoteEditorStateProvider>
              {isNote ? (
                <PusherProvider session={session} slug={pathname}>
                  {children}
                </PusherProvider>
              ) : (
                children
              )}
            </NoteEditorStateProvider>
          </UserSettingsStoreProvider>
        </ThemeProvider>
        <Toaster />
        <SpeedInsights />
      </SessionProvider>
    </TRPCReactProvider>
  )
}
