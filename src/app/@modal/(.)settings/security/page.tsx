import { SettingsSecurity } from "@/components/settings/security"
import { Separator } from "@/components/ui/separator"

export default function SettingsSecurityInterceptedModal() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Security</h2>
        <p className="text-muted-foreground text-sm">
          Manage your security settings
        </p>
      </div>
      <Separator />
      <SettingsSecurity />
    </div>
  )
}
