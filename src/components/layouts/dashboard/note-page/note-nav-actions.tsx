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
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useToggleFavorite } from "@/hooks/use-note"
import { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import { getBaseUrl } from "@/lib/utils"
import { useEditorState } from "@udecode/plate/react"
import { formatDistance } from "date-fns"
import { useParams, usePathname } from "next/navigation"
import { useMemo } from "react"
import { toast } from "sonner"

export function NoteNavActions() {
  const pathname = usePathname()
  const { undo, redo } = useEditorState()
  const { noteId } = useParams<{ noteId: string }>()
  const { note, isLoading, updateNoteFavorite } = useSyncedNoteQueries(noteId)

  const { handleToggleFavorite } = useToggleFavorite({
    note,
    updateNoteFavorite
  })

  const copyLink = () => {
    navigator.clipboard.writeText(`${getBaseUrl()}${pathname}`)
    toast.success("Link successfully copied to clipboard")
  }

  const navMemoDeps = [undo, redo, copyLink]
  const nav = useMemo(
    () => [
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
          icon: Link,
          action: copyLink,
          shortcut: "CTRL+SHIFT+C"
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
          icon: CornerUpLeft,
          action: undo,
          shortcut: "CTRL+Z"
        },
        {
          label: "Redo",
          icon: CornerUpRight,
          action: redo,
          shortcut: "CTRL+Y"
        }
      ],
      [
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
    ],
    navMemoDeps
  )

  return (
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleToggleFavorite}
              disabled={isLoading || !note}
            >
              <Star
                className={
                  note?.isFavorited ? "fill-yellow-400 text-yellow-400" : ""
                }
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {note?.isFavorited ? "Remove from favorites" : "Add to favorites"}
          </TooltipContent>
        </Tooltip>
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
                {nav.map((group, index) => (
                  <SidebarGroup
                    key={index}
                    className="border-b last:border-none"
                  >
                    <SidebarGroupContent className="gap-0">
                      <SidebarMenu>
                        {group.map((item, index) => (
                          <SidebarMenuItem key={index}>
                            <SidebarMenuButton
                              onClick={
                                "action" in item ? item.action : undefined
                              }
                            >
                              <item.icon /> <span>{item.label}</span>
                              {"shortcut" in item ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="ml-auto max-w-20 text-xs tracking-widest opacity-60">
                                      {item.shortcut}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span className="ml-auto text-xs tracking-widest opacity-60">
                                      {item.shortcut}
                                    </span>
                                  </TooltipContent>
                                </Tooltip>
                              ) : null}
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
  )
}
