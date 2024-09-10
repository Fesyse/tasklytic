"use client"

import { useRouter } from "next/navigation"
import { type FC } from "react"
import { Project } from "@/components/projects/project"
import { getProjectsFromLocalStorage } from "@/lib/utils"

type ProjectClientWrapperProps = {
  projectId: string
}

export const ProjectClientWrapper: FC<ProjectClientWrapperProps> = ({
  projectId
}) => {
  const router = useRouter()
  const project = getProjectsFromLocalStorage().find(
    project => project.id === projectId
  )

  if (!project) {
    router.push("/not_found")
    return <></>
  }

  return <Project project={project} />
}
