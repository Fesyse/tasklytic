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
import { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import { authClient } from "@/lib/auth-client"
import type { Note } from "@/lib/db-client"
import { useQueryClient } from "@tanstack/react-query"
import { formatDistance } from "date-fns"
import { useParams } from "next/navigation"
import { useCallback } from "react"
import { toast } from "sonner"

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
  const { noteId } = useParams<{ noteId: string }>()
  const queryClient = useQueryClient()
  const { data: organization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()

  // Use the synced note hook instead of direct Dexie queries
  const { note, isLoading, updateNoteFavorite } = useSyncedNoteQueries(noteId)

  const handleToggleFavorite = useCallback(async () => {
    if (!note || !organization || !session) return

    const newFavoritedState = !note.isFavorited

    // Use the updateNoteFavorite from useSyncedNoteQueries hook
    updateNoteFavorite(
      newFavoritedState,
      newFavoritedState ? session.user.id : null
    )
      .then(({ error }) => {
        if (error) {
          toast.error("Failed to update favorite status")
          console.error(error)
          return
        }

        // Optimistically update the cache
        queryClient.setQueryData(
          ["note", note.id, organization.id],
          (old: Note) => ({
            ...old,
            isFavorited: newFavoritedState,
            favoritedByUserId: newFavoritedState ? session.user.id : null
          })
        )

        toast.success(
          newFavoritedState ? "Added to favorites" : "Removed from favorites"
        )
      })
      .catch((error) => {
        toast.error("Failed to update favorite status")
        console.error(error)
      })
  }, [note, organization, session, updateNoteFavorite, queryClient])

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
  )
}
