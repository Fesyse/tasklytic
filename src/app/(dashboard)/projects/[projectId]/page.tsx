import { Metadata } from "next"
import { api } from "@/trpc/server"

type ProjectsProps = { params: Promise<{ projectId: string }> }

export async function generateMetadata({
  params
}: ProjectsProps): Promise<Metadata> {
  const { projectId } = await params
  const project = await api.projects.getById({ id: projectId })

  return {
    title: project?.name
  }
}

export default async function ProjectPage() {
  return <div></div>
}
