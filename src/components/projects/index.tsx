import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { type FC } from "react"
import { ProjectsGlobe } from "@/components/blocks/projects-globe"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardGlobe } from "@/components/ui/card-globe"
import {
  GlowingStarsBackgroundCard,
  GlowingStarsDescription,
  GlowingStarsTitle
} from "@/components/ui/glowing-stars"
import { cn, title } from "@/lib/utils"
import { type Project, type ProjectWithTasks } from "@/server/db/schema"

type ProjectsProps = {
  projects: Project[] | ProjectWithTasks[]
}

export const Projects: FC<ProjectsProps> = ({ projects }) => {
  // columns
  const c = 17

  // prettier-ignore
  const glowingStarsOnHover: number[] = [
                      8 + c * 1,
                      8 + c * 2,
6 + c * 3, 7 + c * 3, 8 + c * 3, 9 + c * 3, 10 + c * 3,  
                      8 + c * 4,
                      8 + c * 5
  ]
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
                glowingStarsOnHover={glowingStarsOnHover}
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
              <Link href={`/projects/${project.id}`}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{title(project.name)}</CardTitle>
                  </CardHeader>
                  <CardContent
                    className={cn("relative h-[17rem] overflow-hidden")}
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
                        className={cn("absolute -right-12", {
                          "-left-0 sm:-left-20": i % 2 === 1
                        })}
                      />
                    )}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="w-full text-center">
            You dont have any projects right know. Consider{" "}
            <button className="font-bold underline">making one</button>!
          </div>
          <div className="-mt-20">
            <ProjectsGlobe />
          </div>
        </>
      )}
    </section>
  )
}
