"use client"

import { getSettingsNav, SettingsSidebar } from "@/components/settings/sidebar"
import { CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  SETTINGS_TABS,
  useSettingsDialog,
  type SettingsTab
} from "@/lib/stores/settings-dialog"
import { AnimatePresence, motion } from "motion/react"
import { useTranslations } from "next-intl"
import { useMemo, type ReactNode } from "react"

const contentVariants = {
  initial: {
    opacity: 0,
    filter: "blur(24px)",
    height: 0
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    height: "auto"
  },
  exit: {
    opacity: 0,
    filter: "blur(24px)",
    height: 0
  }
}

export function SettingsDialog() {
  const { open, toggleSettingsDialog, tab } = useSettingsDialog()

  const t = useTranslations("Dashboard.Settings.tabs")
  const settingsTabs = useMemo(() => {
    const settingsNav = getSettingsNav(t)

    const descriptionMap: Record<SettingsTab, string> = {
      "account-profile": "accountGroup.profile.description",
      "account-preferences": "accountGroup.preferences.description",
      "account-security": "accountGroup.security.description",
      "organization-general": "organizationGroup.general.description",
      "organization-members": "organizationGroup.members.description",
      "organization-security": "organizationGroup.security.description"
    }

    const acc: Record<
      SettingsTab,
      { title: string; description: string; content: ReactNode }
    > = SETTINGS_TABS.reduce(
      (obj, tab) => {
        obj[tab] = { title: "", description: "", content: null }
        return obj
      },
      {} as Record<
        SettingsTab,
        { title: string; description: string; content: ReactNode }
      >
    )

    settingsNav.forEach((group) => {
      group.items.forEach((item) => {
        acc[item.value] = {
          title: item.label,
          description: t(descriptionMap[item.value] as Parameters<typeof t>[0]),
          content: item.content
        }
      })
    })

    return acc as Record<
      SettingsTab,
      { title: string; description: string; content: ReactNode }
    >
  }, [t])

  return (
    <Dialog
      key="settings-dialog"
      open={open}
      onOpenChange={toggleSettingsDialog}
    >
      <DialogContent className="grid w-full grid-cols-[10rem_1fr] items-start gap-4 overflow-hidden p-0 sm:max-w-4xl">
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
            <div className="relative">
              <AnimatePresence>
                <motion.div
                  key={tab}
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {settingsTabs[tab].content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}
