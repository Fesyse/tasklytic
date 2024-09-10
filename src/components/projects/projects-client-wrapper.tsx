import { Projects } from "@/components/projects"
import { getProjectsFromLocalStorage } from "@/lib/utils"

export const ProjectsClientWrapper = () => {
  const projects = getProjectsFromLocalStorage()

  return <Projects projects={projects} />
}
