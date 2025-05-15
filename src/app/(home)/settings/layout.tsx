import { SettingsSidebar } from "@/components/settings/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings"
}

export default function SettingsLayout(props: React.PropsWithChildren) {
  return (
    <Card className="mx-auto grid max-w-4xl grid-cols-[10rem_1fr] items-start gap-4 py-0">
      <SettingsSidebar />
      <CardContent className="py-6">{props.children}</CardContent>
    </Card>
  )
}
