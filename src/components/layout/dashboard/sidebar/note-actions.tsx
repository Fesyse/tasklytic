"use client"

import {
  Eye,
  EyeOff,
  FilePlus2,
  LinkIcon,
  MoreHorizontal,
  Pin,
  PinOff,
  Trash2
} from "lucide-react"
import { useParams, usePathname, useRouter } from "next/navigation"
import React, { useCallback, type FC } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SidebarMenuAction } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { type SidebarNote } from "@/lib/sidebar"
import { api } from "@/trpc/react"

type NoteActionsProps = {
  note: SidebarNote
  icon?: React.ReactNode
  small?: boolean
}

export const NoteActions: FC<NoteActionsProps> = ({
  note,
  small,
  icon = <MoreHorizontal />
}) => {
  const utils = api.useUtils()
  const isMobile = useIsMobile()
  const router = useRouter()
  const pathname = usePathname()
  const { projectId } = useParams<{ projectId: string }>()

  const invalidate = useCallback(() => {
    return Promise.all([
      utils.folders.getWorkspace.invalidate({ projectId }),
      utils.notes.getAll.invalidate({ projectId }),
      utils.notes.getAllRoot.invalidate({ projectId })
    ])
  }, [utils])

  const { mutate: deleteNote, isPending: isNoteDeleting } =
    api.notes.delete.useMutation({
      onSuccess: async note => {
        toast.success(`Successfully deleted note!`)

        await invalidate()
        if (pathname.startsWith(`/projects/${projectId}/note/${note.id}`)) {
          router.push(`/projects/${projectId}`)
        }
      },
      onError: () => toast.error("An error occurred deleting note! Try again.")
    })
  const { mutate: updateNote, isPending: isNoteUpdating } =
    api.notes.update.useMutation({
      onSuccess: async note => {
        await invalidate()
        router.push(`/projects/${projectId}/note/${note.id}`)
      },
      onError: () => toast.error("An error occurred updating note! Try again.")
    })

  const togglePinned = () => {
    updateNote(
      { id: note.id, isPinned: !note.isPinned },
      {
        onSuccess: async () => {
          await invalidate()
          toast.success(`Successfully ${note.private ? "" : "un"}pinned note!`)
        }
      }
    )
  }
  const togglePrivate = () => {
    updateNote(
      { id: note.id, private: !note.private },
      {
        onSuccess: async () => {
          await invalidate()
          toast.success(
            `Successfully ${note.private ? "" : "un"}made note private!`
          )
        }
      }
    )
  }

  const copyLink = () => {
    navigator.clipboard.writeText(note.href)
    toast.success("Note link copied to clipboard!")
  }
  const openInNewTab = () => {
    window.open(note.href, "_blank")
    toast.success("Note opened in new tab!")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {small ? (
          icon
        ) : (
          <SidebarMenuAction showOnHover>
            {icon}
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-44 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
      >
        <DropdownMenuItem className="gap-2" onClick={openInNewTab}>
          <FilePlus2 size={16} />
          <span>Open in New Tab</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2" onClick={copyLink}>
          <LinkIcon size={16} />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onClick={togglePrivate}>
          {isNoteUpdating ? (
            <LoadingSpinner size={16} />
          ) : note.private ? (
            <Eye size={16} />
          ) : (
            <EyeOff size={16} />
          )}
          <span>{note.private ? "Make Public" : "Make Private"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={togglePinned}>
          {isNoteUpdating ? (
            <LoadingSpinner size={16} />
          ) : note.isPinned ? (
            <Pin className="text-muted-foreground" size={16} />
          ) : (
            <PinOff className="text-muted-foreground" size={16} />
          )}
          <span>{note.isPinned ? "Unpin" : "Pin"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full justify-start gap-2 px-2 py-1.5"
                variant="destructive"
              >
                {isNoteDeleting ? (
                  <LoadingSpinner size={16} />
                ) : (
                  <Trash2 size={16} />
                )}
                <span>Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your note and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteNote({ id: note.id })}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
