import { PostHogProvider } from "@/components/providers/posthog-provider"
import { Toaster } from "@/components/ui/sonner"
import { fileRouter } from "@/server/uploadthing"
import { TRPCReactProvider } from "@/trpc/react"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { extractRouterConfig } from "uploadthing/server"

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
          <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
        </PostHogProvider>
        <SpeedInsights />
      </ThemeProvider>
    </TRPCReactProvider>
  )
}
