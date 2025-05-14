"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AnimatePresence, motion } from "motion/react"

export const InnerSidebarTrigger = () => {
  const { open, isMobile } = useSidebar()

  return (
    <AnimatePresence>
      {!open || isMobile ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SidebarTrigger className="sticky mt-2.5 ml-2.25" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
