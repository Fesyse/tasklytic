"use client"

import { BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { title } from "@/lib/utils"
import { api } from "@/trpc/react"
import { useParams } from "next/navigation"

export const DashboardBreadcrumbPage = () => {
  const { id: projectId, noteId } = useParams<{ id: string; noteId?: string }>()

  const { data: note, isLoading: isLoadingNote } = api.notes.getById.useQuery(
    { id: noteId ?? "" },
    {
      enabled: !!noteId
    }
  )
  const { data: project, isLoading: isLoadingProject } =
    api.projects.getById.useQuery(
      { id: projectId ?? "" },
      {
        enabled: !noteId
      }
    )

  return (
    <BreadcrumbPage className="line-clamp-1">
      {isLoadingNote || isLoadingProject ? (
        <Skeleton className="h-7 w-36" />
      ) : (
        title(note?.title ?? project?.name ?? "")
      )}
    </BreadcrumbPage>
  )
}
