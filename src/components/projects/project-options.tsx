import { AnimatePresence, motion } from "framer-motion"
import { EllipsisVertical } from "lucide-react"
import { type FC } from "react"
import {
  FloatingPanelBody,
  FloatingPanelButton,
  FloatingPanelCloseButton,
  FloatingPanelContent,
  FloatingPanelFooter,
  FloatingPanelForm,
  FloatingPanelLabel,
  FloatingPanelRoot,
  FloatingPanelSubmitButton,
  FloatingPanelTextarea,
  FloatingPanelTrigger
} from "@/components/ui/floading-panel"
import { buttonVariants } from "../ui/button"
import { cn } from "@/lib/utils"
import { type Project } from "@/server/db/schema"

type ProjectOptionsProps = {
  project: Project
}

type Action = {
  icon: React.ReactNode
  label: string
  action: () => void
}

export const ProjectOptions: FC<ProjectOptionsProps> = ({ project }) => {
  const actions: Action[] = [
    // {
    //   icon: <Plus className="w-4 h-4" />,
    //   label: "New File",
    //   action: () => console.log("New File"),
    // },
    // {
    //   icon: <ImageIcon className="w-4 h-4" />,
    //   label: "Upload Image",
    //   action: () => console.log("Upload Image"),
    // },
    // {
    //   icon: <Paintbrush className="w-4 h-4" />,
    //   label: "Edit Colors",
    //   action: () => console.log("Edit Colors"),
    // },
  ]

  return (
    <FloatingPanelRoot>
      <FloatingPanelTrigger
        title="Settings"
        className={cn(
          buttonVariants({ size: "default", variant: "outline" }),
          "flex items-center space-x-2 rounded-md border-0 px-0"
        )}
      >
        <span>
          <EllipsisVertical />
        </span>
      </FloatingPanelTrigger>
      <FloatingPanelContent width={224} side="left">
        <FloatingPanelBody>
          <AnimatePresence>
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: index * 0.1 }}
              >
                <FloatingPanelButton
                  onClick={action.action}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </FloatingPanelButton>
              </motion.div>
            ))}
          </AnimatePresence>
        </FloatingPanelBody>
        <FloatingPanelFooter>
          <FloatingPanelCloseButton />
        </FloatingPanelFooter>
      </FloatingPanelContent>
    </FloatingPanelRoot>
  )
}
