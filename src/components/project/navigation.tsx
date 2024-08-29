"use client"

import Link from "next/link"
import { type FC } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Project } from "@/server/db/schema"

type ProjectNavigationProps = {
  projects: Project[] | null
}

export const ProjectNavigation: FC<ProjectNavigationProps> = ({ projects }) => {
  if (!projects) projects = getProjectsFromLocalStorage()

  return projects.length ? (
    projects.map(project => (
      <li>
        <Button variant="outline" asChild>
          <Link href={`/project/${project.id}/`}>{project.name}</Link>
        </Button>
      </li>
    ))
  ) : (
    <li className="text-center text-sm text-muted-foreground">
      There's no projects yet.
    </li>
  )
}

const projectKeys: (keyof Project)[] = [
  "id",
  "name",
  "userId",
  "createdAt",
  "updatedAt"
]

function getProjectsFromLocalStorage(): Project[] {
  const projects = JSON.parse(localStorage.getItem("guest-projects") ?? "[]")

  if (
    typeof projects === "object" &&
    Array.isArray(projects) &&
    !projects.every(project => projectKeys.every(key => key in project))
  ) {
    toast.error("Your local saved projects has been corrupted or deleted!")
    return []
  }

  if (typeof projects === "undefined") return []
  // above we checked that project is typeof Project
  else return projects as Project[]
}
