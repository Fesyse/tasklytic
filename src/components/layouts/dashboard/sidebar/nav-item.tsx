import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import type { NavItem as TNavItem } from "@/lib/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItemProps = {
  item: TNavItem
}

export function NavItem({ item }: NavItemProps) {
  const pathname = usePathname()

  return item.type === "url" ? (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={pathname === item.url}>
        <Link href={item.url} prefetch>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ) : item.type === "action" ? (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton isActive={item.isActive} onClick={item.action}>
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ) : (
    item.component
  )
}
