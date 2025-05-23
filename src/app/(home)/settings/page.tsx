import { SettingsProfile } from "@/components/settings/profile"
import { Separator } from "@/components/ui/separator"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings"
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator />
      <SettingsProfile />
    </div>
  )
}
