"use client"

import {
  ArrowDown,
  ArrowUp,
  Bell,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  FileText,
  GalleryVerticalEnd,
  LineChart,
  Link,
  MoreHorizontal,
  Settings2,
  Star,
  Trash,
  Trash2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useNoteEditorContext } from "@/contexts/note-editor-context"
import { authClient } from "@/lib/auth-client"
import { getNote } from "@/lib/db-queries"
import { useDexieDb } from "@/lib/use-dexie-db"
import { cn } from "@/lib/utils"
import { formatDistance } from "date-fns"
import { useParams } from "next/navigation"

const data = [
  [
    {
      label: "Customize Page",
      icon: Settings2
    },
    {
      label: "Turn into wiki",
      icon: FileText
    }
  ],
  [
    {
      label: "Copy Link",
      icon: Link
    },
    {
      label: "Duplicate",
      icon: Copy
    },
    {
      label: "Move to",
      icon: CornerUpRight
    },
    {
      label: "Move to Trash",
      icon: Trash2
    }
  ],
  [
    {
      label: "Undo",
      icon: CornerUpLeft
    },
    {
      label: "View analytics",
      icon: LineChart
    },
    {
      label: "Version History",
      icon: GalleryVerticalEnd
    },
    {
      label: "Show delete pages",
      icon: Trash
    },
    {
      label: "Notifications",
      icon: Bell
    }
  ],
  [
    {
      label: "Import",
      icon: ArrowUp
    },
    {
      label: "Export",
      icon: ArrowDown
    }
  ]
]

export function NoteNavActions() {
  const { isMobile } = useSidebar()
  const { noteId } = useParams<{ noteId: string }>()
  const { data: activeOrganization } = authClient.useActiveOrganization()

  const { data: note, isLoading } = useDexieDb(async () => {
    if (!activeOrganization) return
    const { data, error } = await getNote(noteId, activeOrganization.id)

    if (error) {
      console.error(error)
      return null
    }

    return data
  })
  const { isSaving, isAutoSaving, isChanged } = useNoteEditorContext()

  return (
    <>
      {!isMobile ? (
        <div className="flex h-7 items-center justify-center text-sm">
          <button
            className={cn(
              "rounded-md px-2 py-1 transition-opacity duration-200 ease-in-out",
              {
                "opacity-0": !isSaving && !isAutoSaving && !isChanged,
                "opacity-50": isChanged,
                "opacity-100": isSaving || isAutoSaving
              }
            )}
          >
            {isAutoSaving
              ? "Auto-saving..."
              : isSaving
                ? "Saving..."
                : isChanged
                  ? "Unsaved"
                  : null}
          </button>
        </div>
      ) : null}
      <div className="flex h-7 items-center justify-center gap-2 text-sm">
        <TooltipProvider>
          {isLoading || !note ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-muted-foreground hidden font-medium md:inline-block">
                  Edited{" "}
                  {formatDistance(note.updatedAt, new Date(), {
                    addSuffix: true
                  })}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Edited by <strong>{note.updatedByUserName}</strong> on{" "}
                  {formatDistance(note.updatedAt, new Date(), {
                    addSuffix: true
                  })}
                </p>
                <p>
                  Created by <strong>{note.createdByUserName}</strong> on{" "}
                  {formatDistance(note.createdAt, new Date(), {
                    addSuffix: true
                  })}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Star />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="data-[state=open]:bg-accent h-7 w-7"
              >
                <MoreHorizontal />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 overflow-hidden rounded-lg p-0"
              align="end"
            >
              <Sidebar collapsible="none" className="bg-transparent">
                <SidebarContent>
                  {data.map((group, index) => (
                    <SidebarGroup
                      key={index}
                      className="border-b last:border-none"
                    >
                      <SidebarGroupContent className="gap-0">
                        <SidebarMenu>
                          {group.map((item, index) => (
                            <SidebarMenuItem key={index}>
                              <SidebarMenuButton>
                                <item.icon /> <span>{item.label}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  ))}
                </SidebarContent>
              </Sidebar>
            </PopoverContent>
          </Popover>
        </TooltipProvider>
      </div>
    </>
  )
}
