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

  return <Project project={project} />
}
