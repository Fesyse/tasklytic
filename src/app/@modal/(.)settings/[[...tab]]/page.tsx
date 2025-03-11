import { DialogModal } from "@/components/dialog-modal"
import { Settings } from "@/components/settings"
import { type SettingsPageProps } from "@/app/(home)/settings/[[...tab]]/page"

export default async function SettingsPage({ params }: SettingsPageProps) {
  "use cache"

  const { tab } = await params

  return (
    <DialogModal title="Settings" showHeader={false} className="p-0">
      <Settings tab={tab ? tab[0] : "General"} />
    </DialogModal>
  )
}
