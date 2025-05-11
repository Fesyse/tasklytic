"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export const InnerSidebarTrigger = () => {
  const { open, isMobile } = useSidebar()

  return !open || isMobile ? (
    <SidebarTrigger className="sticky mt-2.5 ml-2.25" />
  ) : null
}
