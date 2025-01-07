import { Metadata } from "next"
import { NotesDashboard } from "@/components/projects/project/notes-dashboard"
import {
  noteDashboardFilterSchema,
  NoteDashboardFilterSchema
} from "@/lib/schemas"
import { api } from "@/trpc/server"

export type Filters = Partial<NoteDashboardFilterSchema>

type ProjectsProps = {
  params: Promise<{ projectId: string }>
  searchParams: Promise<Filters>
}

export async function generateMetadata({
  params
}: ProjectsProps): Promise<Metadata> {
  const { projectId } = await params
  const project = await api.projects.getById({ id: projectId })

  return {
    title: project?.name
  }
}

export default async function ProjectPage({
  params,
  searchParams
}: ProjectsProps) {
  const [{ projectId }, filters] = await Promise.all([
    params,
    searchParams.then(data => {
      const result = noteDashboardFilterSchema.safeParse(data)

      return result.success ? result.data : undefined
    })
  ])

  return <NotesDashboard projectId={projectId} filters={filters} />
}
