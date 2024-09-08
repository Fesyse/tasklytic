"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { type FC } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getProjectsFromLocalStorage, title } from "@/lib/utils"
import { api } from "@/trpc/react"

type ProjectBreadcrumbProps = {
  projectId: string
}

export const ProjectBreadcrumb: FC<ProjectBreadcrumbProps> = ({
  projectId
}) => {
  const router = useRouter()
  const { status } = useSession()

  const query = api.project.getById.useQuery({ id: projectId })
  const { isLoading } = query
  let { data: project } = query

  // make sure project is not fetching and user is guest
  if (!project && !isLoading && status === "unauthenticated")
    project = getProjectsFromLocalStorage().find(
      localProject => localProject.id === projectId
    )

  // redirect to not-found if project is not found in database or localstorage
  if (!project && !isLoading) {
    router.push("/not-found")
    return <></>
  }
  return isLoading || !project ? <LoadingSpinner /> : title(project.name)
}
