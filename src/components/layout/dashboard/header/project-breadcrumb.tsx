"use client"

import { useRouter } from "next/navigation"
import { type FC } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { title } from "@/lib/utils"
import { api } from "@/trpc/react"

type ProjectBreadcrumbProps = {
  projectId: string
}

export const ProjectBreadcrumb: FC<ProjectBreadcrumbProps> = ({
  projectId
}) => {
  const router = useRouter()
  const { isLoading, data: project } = api.projects.getById.useQuery({
    id: projectId
  })

  // redirect to not-found if project is not found in database
  if (!project && !isLoading) {
    router.push("/not-found")
    return <></>
  }
  return isLoading || !project ? <LoadingSpinner /> : title(project.name)
}
