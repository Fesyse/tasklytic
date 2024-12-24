import { Modal } from "@/components/modal"
import { CreateProject } from "@/components/projects/create-project"

export default function CreateProjectPage() {
  return (
    <Modal
      title="Create new project"
      description="Workspace where you can manage your tasks with ease."
    >
      <CreateProject />
    </Modal>
  )
}
