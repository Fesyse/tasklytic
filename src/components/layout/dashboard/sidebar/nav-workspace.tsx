import { Accordion } from "@/components/ui/accordion"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import { FolderButton } from "./folder-button"
import { NoteButton } from "./note-button"
import { SidebarAction } from "./sidebar-action"
import { SidebarNav } from "@/lib/sidebar"

type NavWorkspaceProps = {
  workspace: SidebarNav["workspace"]
}

export const NavWorkspace: React.FC<NavWorkspaceProps> = ({ workspace }) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarAction className="mr-2" />
      <SidebarGroupContent>
        <Accordion type="multiple" asChild>
          <SidebarMenu>
            {workspace.items?.length && !workspace.isLoading ? (
              workspace.items.map(item =>
                item.type === "note" ? (
                  <NoteButton key={item.id} note={item} />
                ) : (
                  <FolderButton key={item.id} folder={item} />
                )
              )
            ) : workspace.isLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuSkeleton />
                </SidebarMenuItem>
              ))
            ) : (
              <SidebarMenuItem>
                <span className="ml-2 text-xs text-muted-foreground">
                  No results
                </span>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </Accordion>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
