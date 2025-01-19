"use client"

// import is correct, we need to import it from the primitive
import { AccordionTrigger } from "@radix-ui/react-accordion"
import { useParams, usePathname } from "next/navigation"
import React, { useMemo, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem
} from "@/components/ui/accordion"
import {
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar"
import { NoteButton } from "./note-button"
import { SidebarAction } from "./sidebar-action"
import { SidebarFolder, transformFolders } from "@/lib/sidebar"
import { api } from "@/trpc/react"

type FolderButtonProps = {
  folder: SidebarFolder
}

export const FolderButton: React.FC<FolderButtonProps> = ({ folder }) => {
  const { projectId } = useParams<{ projectId: string }>()
  const pathname = usePathname()

  const [trigger, fetch] = useState(false)
  const { data: subFolders, isLoading } = api.folders.getSubChildren.useQuery(
    { folderId: folder.id },
    {
      enabled: trigger
    }
  )

  const transformedSubFolders = useMemo(
    () => (subFolders ? transformFolders(subFolders, projectId, pathname) : []),
    [subFolders]
  )

  return (
    <AccordionItem
      value={`folder-${folder.id}`}
      className="p-0 m-0 border-none"
      asChild
    >
      <SidebarMenuSubItem>
        <AccordionTrigger
          className="flex flex-1 items-center py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180 relative group/folder-button"
          asChild
        >
          <SidebarMenuButton title={folder.name} onClick={() => fetch(true)}>
            <span>{folder.emoji}</span>
            <span>{folder.name}</span>
            <SidebarAction
              className="opacity-0 group-hover/folder-button:opacity-100 top-1/2 -translate-y-1/2 transition-opacity duration-200"
              folderId={folder.id}
            />
          </SidebarMenuButton>
        </AccordionTrigger>
        <AccordionContent className="p-0 m-0 ml-1" asChild>
          <Accordion type="multiple" asChild>
            <ul className="first:mt-1">
              {!!transformedSubFolders && !isLoading
                ? transformedSubFolders.map(folder => (
                    <FolderButton key={folder.id} folder={folder} />
                  ))
                : Array.from({ length: 2 }).map((_, index) => (
                    <AccordionItem
                      key={index}
                      value={`folder-${index}`}
                      asChild
                    >
                      <li>
                        <AccordionTrigger
                          className="flex flex-1 items-center py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180 relative group/folder-button"
                          asChild
                        >
                          <SidebarMenuButton title="Loading..." />
                        </AccordionTrigger>
                        <AccordionContent className="p-0 m-0" asChild>
                          <SidebarMenuSkeleton />
                        </AccordionContent>
                      </li>
                    </AccordionItem>
                  ))}
              {folder.folders
                ? folder.folders.map(folder => (
                    <FolderButton key={folder.id} folder={folder} />
                  ))
                : null}
              {folder.notes
                ? folder.notes.map(note => (
                    <NoteButton key={note.id} note={note} />
                  ))
                : null}
            </ul>
          </Accordion>
        </AccordionContent>
      </SidebarMenuSubItem>
    </AccordionItem>
  )
}
