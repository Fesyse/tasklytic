"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { type SidebarNav } from "@/lib/menu-list"
import Link from "next/link"

export function NavMain({ navigation }: { navigation: SidebarNav["navMain"] }) {
  return (
    <SidebarMenu>
      {navigation.map(item => {
        const children = (
          <>
            <item.icon />
            <span>{item.title}</span>
          </>
        )
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild={"href" in item}
              isActive={item.isActive}
              onClick={"action" in item ? item.action : undefined}
            >
              {"href" in item ? (
                <Link href={item.href}>{children}</Link>
              ) : (
                children
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
