"use client"

import { EllipsisVertical, Trash } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { type FC, useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  FloatingPanelBody,
  FloatingPanelButton,
  FloatingPanelCloseButton,
  FloatingPanelContent,
  FloatingPanelFooter,
  FloatingPanelRoot,
  FloatingPanelTrigger
} from "@/components/ui/floading-panel"
import { cn } from "@/lib/utils"
import { UpdateProjectButton } from "./update-project-button"
import { UpdateProjectForm } from "./update-project-form"
import { type Project } from "@/server/db/schema"
import { api } from "@/trpc/react"

type ProjectOptionsProps = {
  project: Project
}

type Action =
  | {
      variant: "default"
      icon: React.ReactNode
      label: React.ReactNode
      action: () => void
    }
  | {
      variant: "node"
      children: React.ReactNode
    }

export const ProjectOptions: FC<ProjectOptionsProps> = ({ project }) => {
  const utils = api.useUtils()
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false)
  const { mutate: deleteProject } = api.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate()
      toast.success("Project deleted successfully.")
    },
    onError: error => toast.error(error.message)
  })
  const actions: Action[] = [
    {
      variant: "node",
      children: <UpdateProjectButton setOpen={setIsUpdateFormOpen} />
    },
    {
      variant: "node",
      children: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full justify-start gap-2 rounded-sm px-2"
              variant="destructive"
              size="sm"
            >
              <Trash size={18} /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                project and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProject({ id: project.id })}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }
  ]

  return (
    <>
      <FloatingPanelRoot className="font-comfortaa">
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
          <FloatingPanelBody className="flex flex-col gap-2 py-1.5">
            <AnimatePresence>
              {actions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {action.variant === "default" ? (
                    <Button
                      asChild
                      size="sm"
                      className="justify-start gap-2 rounded-sm px-2"
                    >
                      <FloatingPanelButton onClick={action.action}>
                        {action.icon}
                        <span>{action.label}</span>
                      </FloatingPanelButton>
                    </Button>
                  ) : (
                    action.children
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </FloatingPanelBody>
          <FloatingPanelFooter>
            <FloatingPanelCloseButton />
          </FloatingPanelFooter>
        </FloatingPanelContent>
      </FloatingPanelRoot>
      <Dialog open={isUpdateFormOpen} onOpenChange={setIsUpdateFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update your project</DialogTitle>
            <DialogDescription>
              Rename your project, update icon/logo.
            </DialogDescription>
          </DialogHeader>
          <UpdateProjectForm project={project} />
        </DialogContent>
      </Dialog>
    </>
  )
}
