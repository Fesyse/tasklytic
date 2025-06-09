"use client"

import { CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { SettingsIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { SettingsProfile } from "./profile"
import { SettingsSecurity } from "./security"
import { SettingsSidebar } from "./sidebar"

const settingsTabs = {
  profile: {
    component: <SettingsProfile />,
    title: "Profile Settings",
    description: "Manage your account settings and set e-mail preferences."
  },
  security: {
    component: <SettingsSecurity />,
    title: "Security Settings",
    description: "Manage your account security settings."
  }
}
export type SettingsTab = keyof typeof settingsTabs

export const SettingsDialog = () => {
  const t = useTranslations("Dashboard.Sidebar.NavSecondary")
  const [tab, setTab] = useState<SettingsTab>("profile")

  return (
    <Dialog key="settings-dialog">
      <DialogTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <SettingsIcon />
            <span>{t("settings")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DialogTrigger>
      <DialogContent className="grid w-full grid-cols-[10rem_1fr] items-start gap-4 p-0 sm:max-w-4xl">
        <SettingsSidebar tab={tab} setTab={setTab} />
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
            {settingsTabs[tab].component}
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}
