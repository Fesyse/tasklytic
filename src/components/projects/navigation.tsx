"use client"

import Link from "next/link"
import { type FC } from "react"
import { Button } from "@/components/ui/button"
import { getProjectsFromLocalStorage } from "@/lib/utils"
import { type Project } from "@/server/db/schema"

type ProjectNavigationProps = {
  projects: Project[] | undefined
}

export const ProjectNavigation: FC<ProjectNavigationProps> = ({ projects }) => {
  if (!projects) projects = getProjectsFromLocalStorage()

  return projects.length ? (
    projects.map(project => (
      <li key={project.id}>
        <Button variant="outline" asChild>
          <Link href={`/projects/${project.id}/`}>{project.name}</Link>
        </Button>
      </li>
    ))
  ) : (
    <li className="text-center text-sm text-muted-foreground">
      There&apos;s no projects yet.
    </li>
  )
}
