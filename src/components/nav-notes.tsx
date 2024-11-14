import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { SidebarNav } from "@/lib/menu-list"
import { copyToClipboard, openInNewTab } from "@/lib/utils"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import {
  ArrowUpRight,
  LinkIcon,
  MoreHorizontal,
  Plus,
  Trash2
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu"

export function NavNotes({ notes }: { notes: SidebarNav["notes"] }) {
  const isMobile = useIsMobile()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Notes</SidebarGroupLabel>
      <SidebarGroupAction title="Add Note" onClick={() => {}}>
        <Plus /> <span className="sr-only">Add Note</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {notes.items?.length && !notes.isLoading ? (
            notes.items.map(note => (
              <SidebarMenuItem key={note.name}>
                <SidebarMenuButton asChild>
                  <Link href={note.href}>
                    <span>
                      {note.emoji instanceof Function ? (
                        <note.emoji />
                      ) : (
                        note.emoji
                      )}
                    </span>
                    <span>{note.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal />
                          <span className="sr-only">More</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align={isMobile ? "end" : "start"}
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            copyToClipboard(note.href, { toast: true })
                          }
                          className="flex gap-2"
                        >
                          <LinkIcon
                            size={18}
                            className="text-muted-foreground"
                          />
                          <span>Copy Link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openInNewTab(note.href)}
                          className="flex gap-2"
                        >
                          <ArrowUpRight
                            size={18}
                            className="text-muted-foreground"
                          />
                          <span>Open in New Tab</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {}}
                          className="flex gap-2"
                        >
                          <Trash2 size={18} className="text-muted-foreground" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          ) : notes.isLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            ))
          ) : (
            <SidebarMenuItem>
              <span className="ml-2 text-xs text-muted-foreground">
                No notes
              </span>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <DotsHorizontalIcon />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
