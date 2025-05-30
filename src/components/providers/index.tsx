"use client"

import { PostHogProvider } from "@/components/providers/posthog-provider"
import { Toaster } from "@/components/ui/sonner"
import { env } from "@/env"
import { SyncProvider } from "@/providers/sync-provider"
import { TRPCReactProvider } from "@/trpc/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <TRPCReactProvider>
      <GoogleReCaptchaProvider
        reCaptchaKey={env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
      >
        <SyncProvider>
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
        </SyncProvider>
      </GoogleReCaptchaProvider>
    </TRPCReactProvider>
  )
}
