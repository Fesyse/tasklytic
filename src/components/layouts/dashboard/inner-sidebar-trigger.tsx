"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AnimatePresence, motion } from "motion/react"

export const InnerSidebarTrigger = () => {
  const { open, isMobile } = useSidebar()

  return (
    <AnimatePresence>
      {!open || isMobile ? (
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -25 }}
        >
          <SidebarTrigger className="sticky mt-2.5 ml-2.25" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
