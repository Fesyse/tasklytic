import { SettingsDialog } from "@/components/settings"

export function SettingsProvider({ children }: React.PropsWithChildren) {
  return (
    <>
      {children}
      <SettingsDialog />
    </>
  )
}
