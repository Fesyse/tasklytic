import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { type FC } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardGlobe } from "@/components/ui/card-globe"
import {
  GlowingStarsBackgroundCard,
  GlowingStarsDescription,
  GlowingStarsTitle
} from "@/components/ui/glowing-stars"
import { ProjectOptions } from "@/components/projects/project-options"
import { cn, title } from "@/lib/utils"
import { glowingStarsOnHover_PLUS } from "@/lib/glowing-stars"
import { type Project } from "@/server/db/schema"

type ProjectsProps = {
  projects: Project[]
}

export const Projects: FC<ProjectsProps> = ({ projects }) => {
  return (
    <section
      className={cn("mx-auto w-full max-w-[1000px]", {
        "mt-20": projects.length
      })}
    >
      {projects.length ? (
        <ul className="align-stretch grid grid-cols-1 gap-12 md:grid-cols-2">
          <li>
            <Link href="/create-project">
              <GlowingStarsBackgroundCard
                className="w-full"
                glowingStarsOnHover={glowingStarsOnHover_PLUS}
              >
                <GlowingStarsTitle>Create new project</GlowingStarsTitle>
                <div className="flex items-end justify-between">
                  <GlowingStarsDescription>
                    Project that will accompany all along with your bussines.
                  </GlowingStarsDescription>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsla(0,0%,100%,.1)]">
                    <Plus />
                  </div>
                </div>
              </GlowingStarsBackgroundCard>
            </Link>
          </li>
          {projects.map((project, i) => (
            <li
              key={project.id}
              className={cn({
                "md:col-span-2":
                  (i - (projects.length - 2) === 0 &&
                    projects.length % 2 === 1) ||
                  (i - (projects.length - 1) === 0 && projects.length !== 1)
              })}
            >
              <Card className="h-full">
                <CardHeader className="flex w-full flex-row items-center justify-between">
                  <CardTitle>{title(project.name)}</CardTitle>
                  <ProjectOptions project={project} />
                </CardHeader>
                <Link href={`/projects/${project.id}`}>
                  <CardContent
                    className={cn("relative h-[17rem] overflow-hidden")}
                  >
                    {project.icon ? (
                      <Image
                        src={project.icon}
                        height={i !== 0 && i % 2 === 0 ? 300 : 300}
                        width={i !== 0 && i % 2 === 0 ? 400 : 300}
                        className="absolute left-1/2 top-[calc(50%-10px)] z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl"
                        alt={`${project.name} icon`}
                      />
                    ) : (
                      <CardGlobe
                        className={cn("absolute -right-12", {
                          "-left-0 sm:-left-20": i % 2 === 1
                        })}
                      />
                    )}
                  </CardContent>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="relative z-50 w-full text-center">
            You dont have any projects right know. Consider{" "}
            <Link href="/create-project" className="font-bold underline">
              making one
            </Link>
            !
          </div>
          <div className="-mt-20">
            {/* FIXME: ProjectsGlobe is throwing error */}
            {/* <ProjectsGlobe /> */}
          </div>
        </>
      )}
    </section>
  )
}
