// import is correct, we need to import it from the primitive
import { AccordionTrigger } from "@radix-ui/react-accordion"
import React from "react"
import { AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { SidebarAction } from "./sidebar-action"
import { SidebarFolder } from "@/lib/sidebar"

type FolderButtonProps = {
  folder: SidebarFolder
}

export const FolderButton: React.FC<FolderButtonProps> = ({ folder }) => {
  return (
    <AccordionItem
      value={`folder-${folder.id}`}
      className="p-0 m-0 border-none"
      asChild
    >
      <li>
        <AccordionTrigger
          className="flex flex-1 items-center py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180 relative group/folder-button"
          asChild
        >
          <SidebarMenuButton title={folder.name}>
            <span>{folder.emoji}</span>
            <span>{folder.name}</span>
            <SidebarAction
              className="opacity-0 group-hover/folder-button:opacity-100 top-1/2 -translate-y-1/2 transition-opacity duration-200"
              folderId={folder.id}
            />
          </SidebarMenuButton>
        </AccordionTrigger>
        <AccordionContent className="p-0 m-0">
          {/* {[
            {
              id: "1",
              name: "Untitled",
              emoji: "📝"
            }
          ] */}
          {folder.notes.map(note => (
            <SidebarMenuButton key={note.id} title={note.name} className="ml-1">
              <span>{note.emoji}</span>
              <span>{note.name}</span>
            </SidebarMenuButton>
          ))}
        </AccordionContent>
      </li>
    </AccordionItem>
  )
}
