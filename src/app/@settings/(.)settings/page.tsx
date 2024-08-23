import { Settings } from "@/components/blocks/settings"
import { Modal } from "@/components/modal"

export default function SettingsPage() {
  return (
    <Modal title="Settings" description="Change your and application settings.">
      <Settings />
    </Modal>
  )
}
