"use client"

import { useParams } from "next/navigation"
import { BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { TextMorph } from "@/components/ui/text-morph"
import { title } from "@/lib/utils"
import { api } from "@/trpc/react"

type DashboardBreadcrumbPageProps = {
  defaultTitle?: string
}

export const DashboardBreadcrumbPage: React.FC<
  DashboardBreadcrumbPageProps
> = ({ defaultTitle }) => {
  const { projectId, noteId } = useParams<{
    projectId: string
    noteId?: string
  }>()

  const { data: note, isLoading: isLoadingNote } = api.notes.getById.useQuery(
    { id: noteId!, projectId },
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
      {(isLoadingNote || isLoadingProject) && !defaultTitle ? (
        <Skeleton className="h-7 w-36" />
      ) : (
        <TextMorph>
          {title(note?.title ?? project?.name ?? defaultTitle ?? "")}
        </TextMorph>
      )}
    </BreadcrumbPage>
  )
}
