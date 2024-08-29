import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export const CreateProjectModal = () => {
  return (
    <Button className="group/modal-btn relative overflow-hidden">
      <span className="text-center transition duration-500 group-hover/modal-btn:translate-x-40">
        Create new project
      </span>
      <div className="absolute inset-0 z-20 flex -translate-x-40 items-center justify-center transition duration-500 group-hover/modal-btn:translate-x-0">
        <Plus />
      </div>
    </Button>
  )
}
