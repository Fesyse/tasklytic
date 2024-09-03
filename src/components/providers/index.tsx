"use client"

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { extractRouterConfig } from "uploadthing/server"
import { Toaster } from "@/components/ui/sonner"
import { UserSettingsStoreProvider } from "./user-settings-store-provider"
import { fileRouter } from "@/server/file-upload"
import { TRPCReactProvider } from "@/trpc/react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <TRPCReactProvider>
      <SessionProvider>
        <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserSettingsStoreProvider>{children}</UserSettingsStoreProvider>
        </ThemeProvider>
        <Toaster />
        <SpeedInsights />
      </SessionProvider>
    </TRPCReactProvider>
  )
}
