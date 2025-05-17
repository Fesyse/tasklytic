"use client"

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
import { getBaseUrl } from "@/lib/utils"
import {
  ArrowUpRight,
  LinkIcon,
  MoreHorizontal,
  PlusIcon,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useSidebar()
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("Link successfully copied to clipboard")
  }

  const handleOpenInNewTab = (url: string) => {
    window.open(url, "_blank")
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

  return (
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
            notes.map((item) => {
              const fullUrl = `${getBaseUrl()}${item.url}`
              const isActive = pathname.startsWith(fullUrl)

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url} prefetch>
                      {typeof item.icon === "string" ? (
                        <span className="text-2xl">{item.icon}</span>
                      ) : (
                        <item.icon />
                      )}
                      <span>{item.title.length ? item.title : "Untitled"}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover className="cursor-pointer">
                        <MoreHorizontal />
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
                      <DropdownMenuItem
                        onClick={() => handleOpenInNewTab(fullUrl)}
                      >
                        <ArrowUpRight className="text-muted-foreground" />
                        <span>Open in New Tab</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteNote(item.id)}
                      >
                        <Trash2 className="text-muted-foreground" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              )
            })
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
