"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar
} from "@/components/ui/sidebar"
import { usePrefetchNotes } from "@/hooks/use-prefetch-notes"
import { authClient } from "@/lib/auth-client"
import { dexieDB, type Note } from "@/lib/db-client"
import { createNote, deleteNote } from "@/lib/db-queries"
import type { NoteNavItem } from "@/lib/sidebar"
import { cn, getBaseUrl } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowUpRight,
  ChevronDown,
  LinkIcon,
  MoreHorizontal,
  PlusIcon,
  StarIcon,
  StarOffIcon,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"

export function NavNotes({
  notes,
  type,
  isLoading
}: {
  type: "private" | "shared" | "favorites"
  notes: NoteNavItem[] | undefined
  isLoading: boolean
}) {
  const router = useRouter()
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()

  const handleCreateNote = async () => {
    if (!activeOrganization || !session) return

    const { error, data: noteId } = await createNote({
      organization: activeOrganization,
      user: session.user
    })

    if (error) {
      toast.error("An error occurred while creating the note")
      return
    }

    toast.success("Note created successfully, redirecting...")
    router.push(`/dashboard/note/${noteId}`)
  }

  const getSectionTitle = () => {
    switch (type) {
      case "private":
        return "Private"
      case "shared":
        return "Shared"
      case "favorites":
        return (
          <span className="flex items-center gap-1.5">
            <StarIcon className="size-4 fill-yellow-400 text-yellow-400" />
            Favorites
          </span>
        )
      default:
        return ""
    }
  }

  return (
    <SidebarGroup>
      {!isLoading &&
      !notes?.length &&
      (type === "shared" || type === "favorites") ? null : (
        <SidebarGroupLabel>{getSectionTitle()}</SidebarGroupLabel>
      )}
      {!isLoading &&
      !notes?.length &&
      (type === "shared" || type === "favorites") ? null : (
        <SidebarGroupAction onClick={handleCreateNote}>
          <PlusIcon className="size-4" />
        </SidebarGroupAction>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading || !notes ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))
          ) : !notes.length && type !== "shared" && type !== "favorites" ? (
            <SidebarMenuItem>
              <span className="text-muted-foreground ml-2 text-xs">
                No notes
              </span>
            </SidebarMenuItem>
          ) : (
            notes.map((item) => <Note key={item.id} item={item} />)
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function Note({ item, level = 0 }: { level?: number; item: NoteNavItem }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const pathname = usePathname()
  const { isMobile, open: sidebarOpen } = useSidebar()
  const router = useRouter()
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { prefetchNote } = usePrefetchNotes()
  const queryClient = useQueryClient()
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()

  const fullUrl = `${getBaseUrl()}${item.url}`
  const isActive = pathname === item.url
  const hasSubNotes = item.subNotes?.items && item.subNotes.items.length > 0

  const handleMouseEnter = () => {
    // Prefetch note data when hovering over the note item
    if (item.id) {
      prefetchNote(item.id)
    }

    // Also prefetch child notes if they exist
    if (hasSubNotes && item.subNotes?.items) {
      item.subNotes.items.forEach((childNote) => {
        if (childNote.id) {
          prefetchNote(childNote.id)
        }
      })
    }
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("Link successfully copied to clipboard")
  }

  const handleOpenInNewTab = (url: string) => {
    window.open(url, "_blank")
  }

  const handleAddChildNote = async () => {
    if (!activeOrganization || !session) return

    const { error, data: noteId } = await createNote({
      organization: activeOrganization,
      user: session.user,
      noteId: item.id
    })

    if (error) {
      toast.error("An error occurred while creating the note")
      return
    }

    toast.success("Note created successfully, redirecting...")
    setIsExpanded(true) // Expand the parent to show the new child
    router.push(`/dashboard/note/${noteId}`)
  }

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await deleteNote(noteId)

    if (error) {
      toast.error("An error occurred while deleting the note")
      return
    }

    toast.success("Note deleted successfully")
    if (pathname === `/dashboard/note/${noteId}`) {
      router.push("/dashboard")
    }
  }

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const updateNoteFavorite = useCallback(
    async (isFavorited: boolean, favoritedByUserId: string | null) => {
      if (!item) return { data: null, error: new Error("Note not found") }

      try {
        await dexieDB.notes.update(item.id, {
          isFavorited,
          favoritedByUserId
        })

        return { data: true, error: null }
      } catch (err) {
        console.error("Error updating note favorite status:", err)
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err))
        }
      }
    },
    [item]
  )

  const handleToggleFavorite = () => {
    if (!activeOrganization || !session) return

    const newFavoritedState = !item.isFavorited

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
          ["note", item.id, activeOrganization.id],
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
  }

  return (
    <div className="flex flex-col">
      <SidebarMenuItem
        key={item.id}
        style={{ marginLeft: sidebarOpen ? level * 6 : 0 }}
        className="transition-all duration-200 ease-in-out"
        onMouseEnter={handleMouseEnter}
      >
        <div className="flex w-full items-center">
          <SidebarMenuButton
            isActive={isActive}
            className="group/sidebar-note-button flex-1"
            asChild
          >
            <Link href={item.url} prefetch>
              <span
                className={cn({
                  "transition-all duration-200 ease-in-out group-hover/sidebar-note-button:opacity-0":
                    hasSubNotes,
                  "opacity-0": isExpanded
                })}
              >
                {typeof item.icon === "string" ? (
                  <span>{item.icon}</span>
                ) : (
                  <item.icon className="size-4" />
                )}
              </span>
              {hasSubNotes ? (
                <button
                  onClick={toggleExpanded}
                  className="group/expand-note-button absolute left-2"
                >
                  <ChevronDown
                    className={cn(
                      "text-muted-foreground relative z-10 size-4 opacity-0 transition-all duration-200 ease-in-out group-hover/sidebar-note-button:opacity-100",
                      {
                        "-rotate-90": !isExpanded,
                        "opacity-100": isExpanded
                      }
                    )}
                  />
                  <span className="sr-only">
                    {isExpanded ? "Collapse" : "Expand"}
                  </span>
                  <span className="group-hover/expand-note-button:bg-muted/50 absolute top-1/2 left-1/2 z-7 size-6 -translate-x-1/2 -translate-y-1/2 rounded transition-all duration-200 ease-in-out"></span>
                </button>
              ) : null}
              <span>{item.title.length ? item.title : "Untitled"}</span>
            </Link>
          </SidebarMenuButton>
        </div>

        <DropdownMenu open={isActionsOpen} onOpenChange={setIsActionsOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              showOnHover
              className="group/menu-action right-6 cursor-pointer"
            >
              <MoreHorizontal
                className={cn(
                  "text-muted-foreground group-hover/menu-action:text-foreground transition-all duration-200 ease-in-out",
                  isActionsOpen && "text-foreground"
                )}
              />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
          >
            <DropdownMenuItem onClick={() => handleToggleFavorite()}>
              {item.isFavorited ? (
                <StarOffIcon className="text-muted-foreground" />
              ) : (
                <StarIcon className="text-muted-foreground" />
              )}
              <span>
                {item.isFavorited
                  ? "Remove from favorites"
                  : "Add to favorites"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleCopyLink(fullUrl)}>
              <LinkIcon className="text-muted-foreground" />
              <span>Copy Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenInNewTab(fullUrl)}>
              <ArrowUpRight className="text-muted-foreground" />
              <span>Open in New Tab</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsDeleting(true)}>
              <Trash2 className="text-muted-foreground" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SidebarMenuAction
          showOnHover
          className="group/menu-action cursor-pointer"
          onClick={handleAddChildNote}
        >
          <PlusIcon
            className={cn(
              "text-muted-foreground group-hover/menu-action:text-foreground transition-all duration-200 ease-in-out",
              isActionsOpen && "text-foreground"
            )}
          />
          <span className="sr-only">Add Child Note</span>
        </SidebarMenuAction>
      </SidebarMenuItem>

      {/* Render sub notes */}
      {hasSubNotes && isExpanded && (
        <div className="mt-1">
          {item.subNotes?.isLoading ? (
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          ) : (
            item.subNotes?.items?.map((subItem) => (
              <Note level={level + 1} key={subItem.id} item={subItem} />
            ))
          )}
        </div>
      )}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note {hasSubNotes ? "and all its sub-notes" : ""} from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteNote(item.id)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
