"use client"

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import type { NoteNavItem } from "@/lib/sidebar"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { createNote } from "./create-note-button"

export function NavNotes({
  notes,
  type,
  isLoading
}: {
  type: "private" | "shared"
  notes: NoteNavItem[] | undefined
  isLoading: boolean
}) {
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const pathname = usePathname()

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
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.url)}
                >
                  <Link href={item.url} prefetch>
                    {typeof item.icon === "string" ? (
                      <span className="text-2xl">{item.icon}</span>
                    ) : (
                      <item.icon />
                    )}
                    <span>{item.title.length ? item.title : "Untitled"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
