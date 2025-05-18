"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AnimatePresence, motion } from "motion/react"
import { usePathname } from "next/navigation"

export const InnerSidebarTrigger = () => {
  const { open, isMobile } = useSidebar()
  const pathname = usePathname()

  const isNotePage = pathname.startsWith("/dashboard/note/")

  if (isNotePage) return null

  return (
    <AnimatePresence>
      {!open || isMobile ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SidebarTrigger className="fixed z-10 mt-2.5 ml-2.25" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
