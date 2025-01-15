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
import { WorkspaceAction } from "./workspace-action"
import { SidebarNav } from "@/lib/sidebar"

type NavWorkspaceProps = {
  workspace: SidebarNav["workspace"]
}

export const NavWorkspace: React.FC<NavWorkspaceProps> = ({ workspace }) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <WorkspaceAction />
      <SidebarGroupContent>
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
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
