import { siteConfig } from "@/lib/site-config"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Accept Invitation | ${siteConfig.name}`,
  description: "Accept an invitation to join an organization"
}

export default function AcceptInvitationLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <div className="container max-w-7xl py-10">{children}</div>
}
