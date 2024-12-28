import Link from "next/link"
import React from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/lib/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: SidebarNav["navSecondary"]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => {
            const content = (
              <>
                <item.icon />
                <span>{item.title}</span>
              </>
            )
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild={"href" in item}
                  onClick={"action" in item ? item.action : undefined}
                >
                  {"href" in item ? (
                    <Link href={item.href}>{content}</Link>
                  ) : (
                    content
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
