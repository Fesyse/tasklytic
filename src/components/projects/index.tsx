"use client"

import Image from "next/image"
import Link from "next/link"
import { type FC } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardGlobe } from "@/components/ui/card-globe"
import { cn, getProjectsFromLocalStorage, title } from "@/lib/utils"
import { type Project } from "@/server/db/schema"

type ProjectsProps = {
  projects: Project[] | null
}

export const Projects: FC<ProjectsProps> = ({ projects: _projects }) => {
  const projects = _projects ?? getProjectsFromLocalStorage()

  return (
    <section className="mx-auto mt-20 w-full max-w-[1000px]">
      {[].length ? (
        <ul className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {projects.map((project, i) => (
            <li
              key={project.id}
              className={cn({
                "md:col-span-2": i !== 0 && i % 2 === 0
              })}
            >
              <Link href={`/projects/${project.id}`}>
                <Card>
                  <CardHeader>
                    <CardTitle>{title(project.name)}</CardTitle>
                  </CardHeader>
                  <CardContent
                    className={cn(
                      "relative min-h-48 overflow-hidden sm:min-h-80 md:min-h-48",
                      {
                        "sm:min-h-80": i !== 0 && i % 2 === 0
                      }
                    )}
                  >
                    {project.icon ? (
                      <Image
                        src={project.icon}
                        style={{
                          height: i !== 0 && i % 2 === 0 ? 800 : 200
                        }}
                        className="w-full object-cover px-2 py-2"
                        alt={`${project.name} icon`}
                      />
                    ) : (
                      <CardGlobe
                        className={cn(
                          "absolute -bottom-96 -right-12 sm:-bottom-96 md:-bottom-96",
                          {
                            "-bottom-96 -left-0 sm:-left-20":
                              i !== 0 && i % 2 === 0
                          }
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="w-full text-center">
          You dont have any projects right know. Consider{" "}
          <button className="font-bold underline">making one</button>!
        </div>
      )}
    </section>
  )
}
