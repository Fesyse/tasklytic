import { SettingsSidebar } from "@/components/settings/sidebar"
import { CardContent } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"

export default function SettingsModalLayout(props: React.PropsWithChildren) {
  return (
    <Modal className="w-full !max-w-4xl !p-0">
      <div className="grid grid-cols-[10rem_1fr] items-start gap-4">
        <SettingsSidebar />
        <CardContent className="py-6">{props.children}</CardContent>
      </div>
    </Modal>
  )
}
