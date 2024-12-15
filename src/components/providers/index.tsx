"use client"

import { Toaster } from "@/components/ui/sonner"
import { TRPCReactProvider } from "@/trpc/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { NoteEditorStateProvider } from "./note-editor-state-provider"
import { UserSettingsStoreProvider } from "./user-settings-store-provider"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <TRPCReactProvider>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserSettingsStoreProvider>
            <NoteEditorStateProvider>{children}</NoteEditorStateProvider>
          </UserSettingsStoreProvider>
        </ThemeProvider>
        <Toaster />
        <SpeedInsights />
      </SessionProvider>
    </TRPCReactProvider>
  )
}
