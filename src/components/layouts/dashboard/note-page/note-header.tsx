"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useNoteEditorContext } from "@/contexts/note-editor-context"
import { AnimatePresence, motion } from "motion/react"
import { NoteBreadcrumbs } from "./note-breadcrumbs"
import { NoteNavActions } from "./note-nav-actions"

export function NoteHeader() {
  const { open: sidebarOpen } = useSidebar()
  const { isChanged, isSaving, isAutoSaving } = useNoteEditorContext()

  // Status for display
  const statusText = isSaving
    ? "Saving..."
    : isAutoSaving
      ? "Auto-saving..."
      : isChanged
        ? "Unsaved changes"
        : "Saved"

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center px-4 md:px-6">
      <AnimatePresence>
        {!sidebarOpen ? (
          <motion.div
            initial={{ opacity: 0, width: 0, marginRight: 0 }}
            animate={{ opacity: 1, width: "auto", marginRight: 16 }}
            exit={{ opacity: 0, width: 0, marginRight: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SidebarTrigger />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="hidden md:block">
        <NoteBreadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-2 rounded px-4 py-2 backdrop-blur-2xl">
        <div className="text-muted-foreground mr-4 flex items-center gap-2 text-sm">
          <span>{statusText}</span>
        </div>

        <NoteNavActions />
      </div>
    </div>
  )
}
