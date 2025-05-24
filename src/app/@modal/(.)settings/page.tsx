import { SettingsProfile } from "@/components/settings/profile"
import { Separator } from "@/components/ui/separator"

export default function SettingsInterceptedModal() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-muted-foreground text-sm">
          Manage your profile information
        </p>
      </div>
      <Separator />
      <SettingsProfile />
    </div>
  )
}
