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
import {
  useSettingsDialog,
  type SettingsTab
} from "@/lib/stores/settings-dialog"
import {
  KeyIcon,
  LockIcon,
  Settings2Icon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { SettingsPreferences } from "./preferences"
import { SettingsProfile } from "./profile"
import { SettingsSecurity } from "./security"

export const getSettingsNav = (
  t: ReturnType<typeof useTranslations<"Dashboard.Settings.tabs">>
): {
  label: string
  items: {
    label: string
    value: SettingsTab
    icon: LucideIcon
    content: React.ReactNode
  }[]
}[] =>
  [
    {
      label: t("accountGroup.label"),
      items: [
        {
          label: t("accountGroup.profile.label"),
          value: "account-profile",
          icon: UserIcon,
          content: <SettingsProfile />
        },
        {
          label: t("accountGroup.preferences.label"),
          value: "account-preferences",
          icon: Settings2Icon,
          content: <SettingsPreferences />
        },
        {
          label: t("accountGroup.security.label"),
          value: "account-security",
          icon: LockIcon,
          content: <SettingsSecurity />
        }
      ]
    },
    {
      label: t("organizationGroup.label"),
      items: [
        {
          label: t("organizationGroup.general.label"),
          value: "organization-general",
          icon: SettingsIcon,
          content: <div></div>
        },
        {
          label: t("organizationGroup.members.label"),
          value: "organization-members",
          icon: UsersIcon,
          content: <div></div>
        },
        {
          label: t("organizationGroup.security.label"),
          value: "organization-security",
          icon: KeyIcon,
          content: <div></div>
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
