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
import { LockIcon, UserIcon } from "lucide-react"
import type { SettingsTab } from "."

const settingsNav = [
  {
    label: "Account",
    items: [
      {
        label: "Profile",
        value: "profile",
        icon: UserIcon,
        href: "/settings"
      },
      {
        label: "Security",
        value: "security",
        icon: LockIcon,
        href: "/settings/security"
      }
    ]
  }
] as const

type SettingsSidebarProps = {
  tab: SettingsTab
  setTab: React.Dispatch<React.SetStateAction<SettingsTab>>
}

export function SettingsSidebar({ tab, setTab }: SettingsSidebarProps) {
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
                        onClick={() => setTab(item.value)}
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
