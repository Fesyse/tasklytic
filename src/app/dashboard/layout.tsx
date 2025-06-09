import { DashboardLayout as Layout } from "@/components/layouts/dashboard"
import { SyncProvider } from "@/providers/sync-provider"
import { NextIntlClientProvider } from "next-intl"
import type React from "react"

export default function DashboardLayout({ children }: React.PropsWithChildren) {
  return (
    <SyncProvider>
      <NextIntlClientProvider>
        <Layout>{children}</Layout>
      </NextIntlClientProvider>
    </SyncProvider>
  )
}
