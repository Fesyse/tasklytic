import { SettingsAccountPreferences } from "@/components/settings/account/preferences"
import { SettingsAccountProfile } from "@/components/settings/account/profile"
import { SettingsAccountSecurity } from "@/components/settings/account/security"
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

export type SettingsNav = {
  label: string
  items: {
    label: string
    title: string
    description: string
    value: SettingsTab
    icon: LucideIcon
    content: React.ReactNode
  }[]
}[]

export const getSettingsNav = (
  t: ReturnType<typeof useTranslations<"Dashboard.Settings.tabs">>
): SettingsNav =>
  [
    {
      label: t("accountGroup.label"),
      items: [
        {
          label: t("accountGroup.profile.label"),
          title: t("accountGroup.profile.title"),
          description: t("accountGroup.profile.description"),
          value: "account-profile",
          icon: UserIcon,
          content: <SettingsAccountProfile />
        },
        {
          label: t("accountGroup.preferences.label"),
          title: t("accountGroup.preferences.title"),
          description: t("accountGroup.preferences.description"),
          value: "account-preferences",
          icon: Settings2Icon,
          content: <SettingsAccountPreferences />
        },
        {
          label: t("accountGroup.security.label"),
          title: t("accountGroup.security.title"),
          description: t("accountGroup.security.description"),
          value: "account-security",
          icon: LockIcon,
          content: <SettingsAccountSecurity />
        }
      ]
    },
    {
      label: t("organizationGroup.label"),
      items: [
        {
          label: t("organizationGroup.general.label"),
          title: t("organizationGroup.general.title"),
          description: t("organizationGroup.general.description"),
          value: "organization-general",
          icon: SettingsIcon,
          content: <div></div>
        },
        {
          label: t("organizationGroup.members.label"),
          title: t("organizationGroup.members.title"),
          description: t("organizationGroup.members.description"),
          value: "organization-members",
          icon: UsersIcon,
          content: <div></div>
        },
        {
          label: t("organizationGroup.security.label"),
          title: t("organizationGroup.security.title"),
          description: t("organizationGroup.security.description"),
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
