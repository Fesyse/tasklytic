"use client"

import { PostHogProvider } from "@/components/providers/posthog-provider"
import { Toaster } from "@/components/ui/sonner"
import { TRPCReactProvider } from "@/trpc/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <TRPCReactProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <PostHogProvider>
          <Toaster />
          <NuqsAdapter>{children}</NuqsAdapter>
        </PostHogProvider>
        <SpeedInsights />
      </ThemeProvider>
    </TRPCReactProvider>
  )
}
