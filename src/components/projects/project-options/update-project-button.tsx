import { Pen } from "lucide-react"
import { type FC } from "react"
import { Button } from "@/components/ui/button"
import { useFloatingPanel } from "@/components/ui/floading-panel"

type UpdateProjectButtonProps = {
  setOpen: (isOpen: boolean) => void
}

export const UpdateProjectButton: FC<UpdateProjectButtonProps> = ({
  setOpen
}) => {
  const { closeFloatingPanel } = useFloatingPanel()

  return (
    <Button
      onClick={() => {
        closeFloatingPanel()
        setOpen(true)
      }}
      className="w-full justify-start gap-2 rounded-sm px-2"
      size="sm"
    >
      <Pen size={18} /> Update
    </Button>
  )
}
