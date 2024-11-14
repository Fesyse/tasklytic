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
import { title } from "@/lib/utils"
import type { Note, Project } from "@/server/db/schema"
import { api } from "@/trpc/server"
import { redirect } from "next/navigation"

export async function DashboardLayout({
  params,
  children,
  ...rest
}: React.PropsWithChildren<{
  params: Promise<{ id: string; noteId?: string }>
}>) {
  const { id: projectId, noteId } = await params

  let project: Project | undefined
  let note: Note | undefined
  if (noteId) {
    note = await api.notes.getById({ id: noteId })
    if (!note) redirect("/not-found")
  } else {
    project = await api.projects.getById({ id: projectId })
    console.log(project)
    if (!project) redirect("/not-found")
  }

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
                    {title(
                      note ? note.title : project ? project.name : "Loading..."
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
