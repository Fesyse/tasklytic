"use client"

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
import Link from "next/link"
import { usePathname } from "next/navigation"

const settingsNav = [
  {
    label: "Account",
    items: [
      {
        label: "Profile",
        icon: UserIcon,
        href: "/settings"
      },
      {
        label: "Security",
        icon: LockIcon,
        href: "/settings/security"
      }
    ]
  }
]

export function SettingsSidebar() {
  const pathname = usePathname()

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
                        isActive={pathname === item.href}
                        asChild
                      >
                        <Link href={item.href}>
                          <item.icon /> <span>{item.label}</span>
                        </Link>
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
