import { redirect } from "next/navigation"
import { Project } from "@/components/projects/project"
import { api } from "@/trpc/server"

type ProjectsProps = { params: { id: string } }

export default async function ProjectPage({ params: { id } }: ProjectsProps) {
  const project = await api.project.getById({
    id,
    with: {
      tasks: true
    }
  })

  if (!project) redirect("/not_found")

  return <Project project={project} />
}
