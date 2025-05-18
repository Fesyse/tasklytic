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
import { authClient } from "@/lib/auth-client"
import { createNote, deleteNote } from "@/lib/db-queries"
import type { NoteNavItem } from "@/lib/sidebar"
import { cn, getBaseUrl } from "@/lib/utils"
import {
  ArrowUpRight,
  LinkIcon,
  MoreHorizontal,
  PlusIcon,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function NavNotes({
  notes,
  type,
  isLoading
}: {
  type: "private" | "shared"
  notes: NoteNavItem[] | undefined
  isLoading: boolean
}) {
  const [deletingNoteState, setDeletingNoteState] = useState<{
    isOpen: boolean
    noteId: string
  }>({
    isOpen: false,
    noteId: ""
  })

  const router = useRouter()
  const pathname = usePathname()
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()

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

    toast.success("Note created successfully")
    router.push(`/dashboard/note/${noteId}`)
  }

  return (
    <>
      <SidebarGroup>
        {!isLoading && !notes?.length && type === "shared" ? null : (
          <SidebarGroupLabel>
            {type === "private" ? "Private Notes" : "Shared Notes"}
          </SidebarGroupLabel>
        )}
        {!isLoading && !notes?.length && type === "shared" ? null : (
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
            ) : !notes.length && type === "private" ? (
              <SidebarMenuItem>
                <span className="text-muted-foreground ml-2 text-xs">
                  No notes
                </span>
              </SidebarMenuItem>
            ) : (
              notes.map((item) => (
                <Note
                  key={item.id}
                  item={item}
                  setDeletingNoteState={setDeletingNoteState}
                />
              ))
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <AlertDialog
        open={deletingNoteState.isOpen}
        onOpenChange={(value) =>
          setDeletingNoteState((prev) => ({ ...prev, isOpen: value }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note and remove it from your notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteNote(deletingNoteState.noteId)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function Note({
  item,
  setDeletingNoteState
}: {
  item: NoteNavItem
  setDeletingNoteState: (state: { isOpen: boolean; noteId: string }) => void
}) {
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const fullUrl = `${getBaseUrl()}${item.url}`
  const isActive = pathname === item.url

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("Link successfully copied to clipboard")
  }

  const handleOpenInNewTab = (url: string) => {
    window.open(url, "_blank")
  }

  return (
    <SidebarMenuItem key={item.id}>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.url} prefetch>
          {typeof item.icon === "string" ? (
            <span>{item.icon}</span>
          ) : (
            <item.icon />
          )}
          <span>{item.title.length ? item.title : "Untitled"}</span>
        </Link>
      </SidebarMenuButton>

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
          <DropdownMenuItem onClick={() => handleCopyLink(fullUrl)}>
            <LinkIcon className="text-muted-foreground" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenInNewTab(fullUrl)}>
            <ArrowUpRight className="text-muted-foreground" />
            <span>Open in New Tab</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              setDeletingNoteState({
                isOpen: true,
                noteId: item.id
              })
            }
          >
            <Trash2 className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SidebarMenuAction
        showOnHover
        className="group/menu-action cursor-pointer"
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
  )
}
