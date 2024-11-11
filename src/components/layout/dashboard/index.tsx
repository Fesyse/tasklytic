"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { NavActions } from "@/components/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"
import { useParams } from "next/navigation"

export function DashboardLayout({ children }: React.PropsWithChildren) {
  const { id: projectId, noteId } = useParams<{ id: string; noteId?: string }>()
  const { data: project, isLoading: isProjectsLoading } =
    api.projects.getById.useQuery(
      {
        id: projectId
      },
      { enabled: !noteId }
    )
  const { data: note, isLoading: isNoteLoading } = api.notes.getById.useQuery(
    {
      // remove ts error, either way it's not used when its not note page
      id: noteId ?? "ID"
    },
    { enabled: !!noteId }
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    {noteId && note && !isNoteLoading ? (
                      note.title
                    ) : isNoteLoading ? (
                      <Skeleton className="h-6 w-24" />
                    ) : project && !isProjectsLoading ? (
                      project.name
                    ) : (
                      <Skeleton className="h-6 w-24" />
                    )}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
