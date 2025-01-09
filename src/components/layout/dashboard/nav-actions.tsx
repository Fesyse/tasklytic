"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { useEditorRef } from "@udecode/plate-common/react"
import { format } from "date-fns"
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Check,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  FilePlus2,
  FileText,
  GalleryVerticalEnd,
  LineChart,
  Link,
  PenLine,
  Settings2,
  Trash
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
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
import { useNoteEditorState } from "@/components/providers/note-editor-state-provider"
import {
  copyToClipboard,
  exportFile,
  importFile,
  openInNewTab
} from "@/lib/utils"
import { type Note } from "@/server/db/schema"

type NavActionsProps = {
  note: Note
}

export function NavActions({ note }: NavActionsProps) {
  const editor = useEditorRef()
  const { saved } = useNoteEditorState(s => s)

  const [isOpen, setIsOpen] = useState(false)

  const exportContent = () => {
    const content = editor.children
    const fileName = `${note.title}.json.taly`

    exportFile(JSON.stringify(content), fileName)
    toast.success(`Note successfully exported as ${fileName}!`)
  }
  const importContent = () => {
    importFile(async reader => {
      try {
        const content = JSON.parse(reader.result as string)
        editor.insertNodes(content)

        toast.success("Note successfully imported!")
      } catch {
        toast.error("Failed to import note! File is probably corrupted.")
      }
    })
  }

  const data = useMemo(() => {
    return [
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
          label: "Open in New Tab",
          icon: FilePlus2,
          action: () => openInNewTab(window.location.href)
        },
        {
          label: "Copy Link",
          icon: Link,
          action: () => {
            copyToClipboard(window.location.href, {
              toast: true,
              toastText: "Note link copied to clipboard!"
            })
            setIsOpen(false)
          }
        },
        {
          label: "Duplicate",
          icon: Copy
        }
      ],
      [
        {
          label: "Undo",
          icon: CornerUpLeft,
          action: () => editor.undo()
        },
        {
          label: "Redo",
          icon: CornerUpRight,
          action: () => editor.redo()
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
          icon: ArrowUp,
          action: importContent
        },
        {
          label: "Export",
          icon: ArrowDown,
          action: exportContent
        }
      ]
    ]
  }, [editor])

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
          Edited {format(note.updatedAt ?? new Date(), "HH:mm do MMM")}
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
                          <SidebarMenuButton onClick={item.action}>
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
