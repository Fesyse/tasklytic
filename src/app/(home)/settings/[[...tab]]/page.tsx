import { Card } from "@/components/ui/card"
import { Settings, SettingsTab } from "@/components/blocks/settings"

export type SettingsPageProps = {
  params: Promise<{
    tab: [SettingsTab["title"]]
  }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { tab } = await params

  return (
    <Card className="max-w-2xl w-full">
      <Settings tab={tab ? tab[0] : "General"} />
    </Card>
  )
}
