import { SettingsProfile } from "@/components/settings/profile"
import { SettingsSecurity } from "@/components/settings/security"
import { SettingsSidebar } from "@/components/settings/sidebar"
import { CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useSettingsDialog } from "@/lib/stores/settings-dialog"
import { useTranslations } from "next-intl"
import { useMemo } from "react"

const getSettingsTabs = (
  t: ReturnType<typeof useTranslations<"Dashboard.Settings.tabs">>
) => ({
  profile: {
    content: <SettingsProfile />,
    title: t("profile.title"),
    description: t("profile.description")
  },
  security: {
    content: <SettingsSecurity />,
    title: t("account.title"),
    description: t("account.description")
  }
})
export type SettingsTab = keyof ReturnType<typeof getSettingsTabs>

export function SettingsProvider({ children }: React.PropsWithChildren) {
  const { open, toggleSettingsDialog, tab } = useSettingsDialog()

  const t = useTranslations("Dashboard.Settings.tabs")
  const settingsTabs = useMemo(() => getSettingsTabs(t), [t])

  return (
    <>
      {children}
      <Dialog
        key="settings-dialog"
        open={open}
        onOpenChange={toggleSettingsDialog}
      >
        <DialogContent className="grid w-full grid-cols-[10rem_1fr] items-start gap-4 p-0 sm:max-w-4xl">
          <SettingsSidebar />
          <CardContent className="py-6">
            <div className="flex flex-col gap-4">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">
                  {settingsTabs[tab].title}
                </h2>
                <p className="text-muted-foreground">
                  {settingsTabs[tab].description}
                </p>
              </div>
              <Separator />
              {settingsTabs[tab].content}
            </div>
          </CardContent>
        </DialogContent>
      </Dialog>
    </>
  )
}
