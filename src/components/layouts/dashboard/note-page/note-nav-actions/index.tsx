"use client"

import {
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
  Trash2,
  type LucideIcon
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
import { useFormatter, useNow, useTranslations } from "next-intl"
import { useParams, usePathname } from "next/navigation"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"
import { ExportActionButton } from "./export-action"
import { ImportActionButton } from "./import-action"

type NoteNavActionsType = (
  | {
      label: string
      icon: LucideIcon
      shortcut?: string
      action: () => void
      type: "action"
    }
  | {
      component: React.FC
      type: "component"
    }
)[][]

export function NoteNavActions() {
  const t = useTranslations("Dashboard.NoteEditor.Header")
  const format = useFormatter()
  const now = useNow()

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
  const nav = useMemo<NoteNavActionsType>(
    () => [
      [
        {
          label: t("NoteNavActions.customizePage"),
          icon: Settings2,
          action: () => {},
          type: "action"
        },
        {
          label: t("NoteNavActions.turnIntoWiki"),
          icon: FileText,
          action: () => {},
          type: "action"
        }
      ],
      [
        {
          label: t("NoteNavActions.copyLink"),
          icon: Link,
          action: copyLink,
          shortcut: "CTRL+SHIFT+C",
          type: "action"
        },
        {
          label: t("NoteNavActions.duplicate"),
          icon: Copy,
          action: () => {},
          type: "action"
        },
        {
          label: t("NoteNavActions.moveTo"),
          icon: CornerUpRight,
          action: () => {},
          type: "action"
        },
        {
          label: t("NoteNavActions.moveToTrash"),
          icon: Trash2,
          action: () => {},
          type: "action"
        }
      ],
      [
        {
          label: t("NoteNavActions.undo"),
          icon: CornerUpLeft,
          action: undo,
          shortcut: "CTRL+Z",
          type: "action"
        },
        {
          label: t("NoteNavActions.redo"),
          icon: CornerUpRight,
          action: redo,
          shortcut: "CTRL+Y",
          type: "action"
        }
      ],
      [
        {
          label: t("NoteNavActions.viewAnalytics"),
          icon: LineChart,
          action: () => {},
          type: "action"
        },
        {
          label: t("NoteNavActions.versionHistory"),
          icon: GalleryVerticalEnd,
          action: () => {},
          type: "action"
        },
        {
          label: t("NoteNavActions.showDeletePages"),
          icon: Trash,
          action: () => {},
          type: "action"
        },
        {
          label: t("NoteNavActions.notifications"),
          icon: Bell,
          action: () => {},
          type: "action"
        }
      ],
      [
        {
          component: ImportActionButton,
          type: "component"
        },
        {
          component: ExportActionButton,
          type: "component"
        }
      ]
    ],
    navMemoDeps
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for CTRL+SHIFT+C (case-insensitive)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "c" || e.key === "C")
      ) {
        e.preventDefault()
        copyLink()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [copyLink])

  return (
    <div className="flex h-7 items-center justify-center gap-2 text-sm">
      <TooltipProvider>
        {isLoading || !note ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-muted-foreground hidden font-medium md:inline-block">
                {t("EditedState.edited")}{" "}
                {format.relativeTime(note.updatedAt, now)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t("EditedState.editedBy")}{" "}
                <strong>{note.updatedByUserName}</strong>{" "}
                {format.relativeTime(note.updatedAt, now)}
              </p>
              <p>
                {t("EditedState.createdBy")}{" "}
                <strong>{note.createdByUserName}</strong>{" "}
                {format.relativeTime(note.updatedAt, now)}
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
            {t("toggleFavorite", {
              isFavorited: note?.isFavorited ? "true" : "false"
            })}
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
            className="overflow-hidden rounded-lg p-0"
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
                        {group.map((item, index) =>
                          item.type === "action" ? (
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
                          ) : (
                            <item.component key={index} />
                          )
                        )}
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
