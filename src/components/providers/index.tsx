"use client"

import { SpeedInsights } from "@vercel/speed-insights/next"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"
import { isNotePage } from "@/lib/utils"
import { NoteEditorStateProvider } from "./note-editor-state-provider"
import { UserSettingsStoreProvider } from "./user-settings-store-provider"
import { PusherProvider } from "@/lib/pusher"
import { TRPCReactProvider } from "@/trpc/react"

export function Providers({ children }: React.PropsWithChildren) {
  const pathname = usePathname()
  const isNote = isNotePage(pathname)

  return (
    <TRPCReactProvider>
      <SessionProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <UserSettingsStoreProvider>
            <NoteEditorStateProvider>
              {isNote ? (
                <PusherProvider slug={pathname}>{children}</PusherProvider>
              ) : (
                children
              )}
            </NoteEditorStateProvider>
          </UserSettingsStoreProvider>
        </NextThemesProvider>
        <Toaster />
        <SpeedInsights />
      </SessionProvider>
    </TRPCReactProvider>
  )
}
