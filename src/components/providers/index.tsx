"use client"

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { NoteEditorStateProvider } from "./note-editor-state-provider"
import { UserSettingsStoreProvider } from "./user-settings-store-provider"
import { TRPCReactProvider } from "@/trpc/react"

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <TRPCReactProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <UserSettingsStoreProvider>
          <NoteEditorStateProvider>
            {/* <AuthToastProvider> */}
            {children}
            {/* </AuthToastProvider> */}
          </NoteEditorStateProvider>
        </UserSettingsStoreProvider>
      </NextThemesProvider>
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </TRPCReactProvider>
  )
}
