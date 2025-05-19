"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AnimatePresence, motion } from "motion/react"

export const NoteSidebarTrigger = () => {
  const { open, isMobile } = useSidebar()

  return (
    <AnimatePresence>
      {!open || isMobile ? (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
        >
          <SidebarTrigger className="size-8" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
