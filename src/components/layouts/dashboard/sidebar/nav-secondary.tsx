"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu
} from "@/components/ui/sidebar"
import type { NavItem as TNavItem } from "@/lib/sidebar"
import { NavItem } from "./nav-item"

export function NavSecondary({
  items,
  ...props
}: {
  items: TNavItem[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item, i) => (
            <NavItem item={item} key={i} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
