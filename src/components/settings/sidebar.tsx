import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from "@/components/ui/sidebar"
import { useSettingsDialog } from "@/lib/stores/settings-dialog"
import { LockIcon, UserIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"

const getSettingsNav = (
  t: ReturnType<typeof useTranslations<"Dashboard.Settings.tabs">>
) =>
  [
    {
      label: t("accountGroup.label"),
      items: [
        {
          label: t("accountGroup.profile.label"),
          value: "profile",
          icon: UserIcon
        },
        {
          label: t("accountGroup.security.label"),
          value: "security",
          icon: LockIcon
        }
      ]
    }
  ] as const

export function SettingsSidebar() {
  const t = useTranslations("Dashboard.Settings.tabs")
  const settingsNav = useMemo(() => getSettingsNav(t), [t])
  const { setSettingsDialogTab, tab } = useSettingsDialog()

  return (
    <SidebarProvider className="bg-noise min-h-full w-auto border-r">
      <Sidebar collapsible="none" className="bg-inherit">
        <SidebarContent>
          {settingsNav.map((group, index) => (
            <SidebarGroup key={index} className="border-b last:border-none">
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent className="gap-0">
                <SidebarMenu>
                  {group.items.map((item, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton
                        isActive={tab === item.value}
                        onClick={() => setSettingsDialogTab(item.value)}
                      >
                        <item.icon /> <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
