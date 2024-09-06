"use client"

import Link from "next/link"
import { type FC } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardGlobe } from "../ui/card-globe"
import { getProjectsFromLocalStorage, title } from "@/lib/utils"
import { type Project } from "@/server/db/schema"

type ProjectsProps = {
  projects: Project[] | null
}

export const Projects: FC<ProjectsProps> = ({ projects: _projects }) => {
  const projects = _projects ?? getProjectsFromLocalStorage()

  return (
    <section>
      <ul className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <li key={project.id}>
            <Link href={`/projects/${project.id}`}>
              <Card>
                <CardHeader>
                  <CardTitle>{title(project.name)}</CardTitle>
                </CardHeader>
                <CardContent className="relative min-h-48 overflow-hidden">
                  <CardGlobe
                    className="absolute -bottom-56 -right-24 sm:-right-20 md:-bottom-52 md:-right-32"
                    width={400}
                    height={400}
                  />
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
