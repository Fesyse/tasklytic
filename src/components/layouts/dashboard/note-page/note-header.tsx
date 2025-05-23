"use client"

import { Button } from "@/components/ui/button"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useNoteEditorContext } from "@/contexts/note-editor-context"
import { cn } from "@/lib/utils"
import { useSyncContext } from "@/providers/sync-provider"
import { format } from "date-fns"
import { AlertCircle, CheckCircle, Cloud, Loader } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { NoteBreadcrumbs } from "./note-breadcrumbs"
import { NoteNavActions } from "./note-nav-actions"

export function NoteHeader() {
  const { open: sidebarOpen } = useSidebar()
  const { isChanged, isSaving, isAutoSaving } = useNoteEditorContext()
  const { syncStatus, lastSyncedAt, syncNow } = useSyncContext()
  const [timeAgo, setTimeAgo] = useState<string>("")

  // Format the last synced time
  useEffect(() => {
    if (!lastSyncedAt) {
      setTimeAgo("Never")
      return
    }

    try {
      setTimeAgo(format(lastSyncedAt, "MMM d, h:mm a"))
    } catch (e) {
      setTimeAgo("Invalid date")
    }

    // Update the time ago every minute
    const intervalId = setInterval(() => {
      try {
        setTimeAgo(format(lastSyncedAt, "MMM d, h:mm a"))
      } catch (e) {
        setTimeAgo("Invalid date")
      }
    }, 60 * 1000)

    return () => clearInterval(intervalId)
  }, [lastSyncedAt])

  // Status for display
  const statusText = isSaving
    ? "Saving..."
    : isAutoSaving
      ? "Auto-saving..."
      : isChanged
        ? "Unsaved changes"
        : "Saved"

  // Sync status icon
  const getSyncIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <Loader className="h-4 w-4 animate-spin" />
      case "error":
        return <AlertCircle className="text-destructive h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Cloud className="h-4 w-4" />
    }
  }

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

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                syncStatus === "error" &&
                  "text-destructive hover:text-destructive"
              )}
              onClick={() => syncNow()}
              disabled={syncStatus === "syncing"}
            >
              {getSyncIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-semibold">
                Sync Status:{" "}
                {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
              </div>
              <div>Last synced: {timeAgo}</div>
            </div>
          </TooltipContent>
        </Tooltip>

        <NoteNavActions />
      </div>
    </div>
  )
}
