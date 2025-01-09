import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList
} from "@/components/ui/breadcrumb"
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
    <div className="flex flex-col items-between w-full sticky top-0 left-0">
      <header className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <DashboardBreadcrumbPage defaultTitle={note.title} />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-3">
          <NavActions note={note} />
        </div>
      </header>

      <FixedToolbar className="w-full justify-center">
        <div className="w-max max-w-full px-3">
          <FixedToolbarButtons />
        </div>
      </FixedToolbar>
      {children}
    </div>
  )
}
