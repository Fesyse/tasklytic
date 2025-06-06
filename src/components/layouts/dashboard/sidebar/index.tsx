"use client"

import { NavMain } from "@/components/layouts/dashboard/sidebar/nav-main"
import { NavSecondary } from "@/components/layouts/dashboard/sidebar/nav-secondary"
import { NavUser } from "@/components/layouts/dashboard/sidebar/nav-user"
import { OrganizationSwitcher } from "@/components/layouts/dashboard/sidebar/organization-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { useSidebarNav } from "@/lib/sidebar"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { NavNotes } from "./nav-notes"

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar()
  const sidebarNav = useSidebarNav()

  return (
    <Sidebar
      collapsible="icon"
      className={cn("overflow-x-hidden", className)}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <OrganizationSwitcher />
            {open ? (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SidebarTrigger className="size-8" />
                </motion.div>
              </AnimatePresence>
            ) : null}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <AnimatePresence>
              {!open ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: {
                      duration: 0.1
                    }
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <SidebarTrigger className="size-8" />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent scrollAreaClassName="[&>[data-slot='scroll-area-viewport']>div]:!flex [&>[data-slot='scroll-area-viewport']>div]:flex-col">
        <NavMain items={sidebarNav.navMain} />
        {sidebarNav.isNotesLoading ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            <NavNotes notes={sidebarNav.favoriteNotes} type="favorites" />
            <NavNotes notes={sidebarNav.privateNotes} type="private" />
            <NavNotes notes={sidebarNav.sharedNotes} type="shared" />
          </>
        )}
        <NavSecondary items={sidebarNav.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
