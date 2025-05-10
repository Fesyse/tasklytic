"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export const InnerSidebarTrigger = () => {
  const { open } = useSidebar()

  return !open ? <SidebarTrigger className="sticky mt-2.5 ml-2.25" /> : null
}
