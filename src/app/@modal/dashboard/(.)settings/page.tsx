import { SettingsProfile } from "@/components/settings/profile"
import { Card } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"

export default function SettingsInterceptedModal() {
  return (
    <Modal
      title="Settings"
      description="Manage your account settings and preferences."
    >
      <Card className="p-6">
        <SettingsProfile />
      </Card>
    </Modal>
  )
}
