import { ProjectNavigation as ProjectNavigationClient } from "@/components/project/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { random } from "@/lib/utils"
import { api } from "@/trpc/server"

export const ProjectNavigation = async () => {
  const projects = await api.project.getAll()

  return <ProjectNavigationClient projects={projects} />
}

export const ProjectNavigationLoading = () => {
  return new Array<React.ReactNode>(random(3, 10)).fill(
    <li>
      <Skeleton className="h-8 w-full" />
    </li>
  )
}
