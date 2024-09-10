import { type FC } from "react"
import { type ProjectWithTasks } from "@/server/db/schema"

type ProjectProps = {
  project: ProjectWithTasks
}

export const Project: FC<ProjectProps> = ({}) => {
  return <div>Project</div>
}
