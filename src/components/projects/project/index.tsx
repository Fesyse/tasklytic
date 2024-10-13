import { type FC } from "react"
import { type ProjectWithNotes } from "@/server/db/schema"

type ProjectProps = {
  project: ProjectWithNotes
}

export const Project: FC<ProjectProps> = () => {
  return <div>Project</div>
}
