import { PlateEditor } from "@/components/editor/plate-editor"
import { SettingsProvider } from "@/components/editor/settings"

export default function NotePage() {
  return (
    <div className="h-screen w-full pt-20" data-registry="plate">
      <SettingsProvider>
        <PlateEditor />
      </SettingsProvider>
    </div>
  )
}
