"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import type { NoteNavItem } from "@/lib/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavNotes({
  notes,
  type,
  isLoading
}: {
  type: "private" | "shared"
  notes: NoteNavItem[] | undefined
  isLoading: boolean
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {!isLoading && !notes?.length && type === "shared" ? null : (
        <SidebarGroupLabel>
          {type === "private" ? "Private Notes" : "Shared Notes"}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading || !notes ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))
          ) : !notes.length && type === "private" ? (
            <SidebarMenuItem>
              <span className="text-muted-foreground ml-2 text-xs">
                No notes
              </span>
            </SidebarMenuItem>
          ) : (
            notes.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.url)}
                >
                  <Link href={item.url} prefetch>
                    {typeof item.icon === "string" ? (
                      <span className="text-2xl">{item.icon}</span>
                    ) : (
                      <item.icon />
                    )}
                    <span>{item.title.length ? item.title : "Untitled"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
