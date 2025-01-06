import { NotesDashboard } from "@/components/projects/project/notes-dashboard"
import { api } from "@/trpc/server"
import { Metadata } from "next"

export type ProjectsProps = { params: Promise<{ projectId: string }> }

export async function generateMetadata({
  params
}: ProjectsProps): Promise<Metadata> {
  const { projectId } = await params
  const project = await api.projects.getById({ id: projectId })

  return {
    title: project?.name
  }
}

export default async function ProjectPage({ params }: ProjectsProps) {
  const { projectId } = await params
  
  return <NotesDashboard projectId={projectId} />
}
