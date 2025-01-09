import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList
} from "@/components/ui/breadcrumb"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { FixedToolbar } from "@/components/plate-ui/fixed-toolbar"
import { FixedToolbarButtons } from "@/components/plate-ui/fixed-toolbar-buttons"
import { DashboardBreadcrumbPage } from "./breadcrumb-page"
import { NavActions } from "./nav-actions"
import { Note } from "@/server/db/schema"

type NoteLayoutProps = React.PropsWithChildren<{
  note: Note
}>

export function NoteLayout({ children, note }: NoteLayoutProps) {
  return (
    <div className="flex flex-col items-between w-full">
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
          <NavActions note={note} />
        </div>
      </header>

      <FixedToolbar className="relative w-full">
        <ScrollArea
          aria-orientation="horizontal"
          className="w-full overflow-x-auto"
        >
          <div className="flex w-max max-w-full px-3">
            <FixedToolbarButtons />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </FixedToolbar>
      {children}
    </div>
  )
}
