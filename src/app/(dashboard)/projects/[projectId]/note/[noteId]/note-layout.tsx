"use client"

import { DashboardBreadcrumbPage } from "@/components/layout/dashboard/breadcrumb-page"
import { NavActions } from "@/components/layout/dashboard/nav-actions"
import { FixedToolbar } from "@/components/plate-ui/fixed-toolbar"
import { FixedToolbarButtons } from "@/components/plate-ui/fixed-toolbar-buttons"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useNoteEditor } from "@/hooks/use-note-editor"
import { Block } from "@/server/db/schema"
import { Plate } from "@udecode/plate-common/react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

type NoteLayoutProps = React.PropsWithChildren<{
  blocks: Block[]
}>

export function NoteLayout({ blocks, children }: NoteLayoutProps) {
  const { editor, handleChange } = useNoteEditor({ blocks })

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor} onValueChange={handleChange}>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <DashboardBreadcrumbPage />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        <FixedToolbar className="px-3">
          <FixedToolbarButtons />
        </FixedToolbar>
        {children}
      </Plate>
    </DndProvider>
  )
}
