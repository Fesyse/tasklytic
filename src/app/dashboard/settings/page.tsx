import { SettingsProfile } from "@/components/settings/profile"
import { SettingsTabs } from "@/components/settings/tabs"
import { Card } from "@/components/ui/card"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings"
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <SettingsTabs defaultValue="profile" orientation="vertical" />
        </div>

        <div className="col-span-9">
          <Card className="p-6">
            <SettingsProfile />
          </Card>
        </div>
      </div>
    </div>
  )
}
