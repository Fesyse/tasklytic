import { SettingsSecurity } from "@/components/settings/security"
import { SettingsTabs } from "@/components/settings/tabs"
import { Card } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"

export default function SettingsSecurityInterceptedModal() {
  return (
    <Modal>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="mb-1 text-2xl font-bold">Security Settings</h2>
          <p className="text-muted-foreground text-sm">
            Manage your account security and authentication.
          </p>
        </div>

        <div className="flex flex-col space-y-6">
          <div>
            <SettingsTabs defaultValue="security" orientation="horizontal" />
          </div>

          <Card className="p-6">
            <SettingsSecurity />
          </Card>
        </div>
      </div>
    </Modal>
  )
}
