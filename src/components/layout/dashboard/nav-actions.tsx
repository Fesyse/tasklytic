"use client"

import {
  ArrowDown,
  ArrowUp,
  Bell,
  Check,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  FileText,
  GalleryVerticalEnd,
  LineChart,
  Link,
  PenLine,
  Settings2,
  Trash,
  Trash2
} from "lucide-react"

import { useNoteEditorState } from "@/components/providers/note-editor-state-provider"
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
import { api } from "@/trpc/react"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { useState } from "react"

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

export function NavActions() {
  const { saved } = useNoteEditorState(s => s)
  const { noteId } = useParams<{ id: string; noteId: string }>()
  const { data: note, isLoading } = api.notes.getById.useQuery({ id: noteId })
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden select-none font-medium text-muted-foreground md:inline-flex md:items-center md:gap-2">
        <span className="flex items-center gap-1">
          {saved ? "Saved" : "Not saved"}
          {saved ? (
            <Check size={14} className="text-muted-foreground" />
          ) : (
            <PenLine size={14} className="text-muted-foreground" />
          )}
        </span>
        |
        <span className="flex items-center gap-1">
          Edited{" "}
          {isLoading || !note ? (
            <Skeleton className="h-5 w-14" />
          ) : (
            format(note.updatedAt ?? new Date(), "HH:mm do MMM")
          )}
        </span>
      </div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 data-[state=open]:bg-accent"
          >
            <DotsHorizontalIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
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
    </div>
  )
}
