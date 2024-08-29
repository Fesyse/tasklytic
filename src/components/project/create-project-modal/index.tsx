"use client"

import { Plus } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"

export const CreateProjectModal = () => {
  const isDesktop = useMediaQuery("(min-width: 640px)")
  const ui = {
    trigger: (
      <Button className="group/modal-btn relative overflow-hidden">
        <span className="text-center transition duration-500 group-hover/modal-btn:translate-x-40">
          Create new project
        </span>
        <div className="absolute inset-0 z-20 flex -translate-x-40 items-center justify-center transition duration-500 group-hover/modal-btn:translate-x-0">
          <Plus />
        </div>
      </Button>
    ),
    content: {
      title: "Create new project",
      description: "Workspace where you can manage your tasks with ease.",
      body: <div></div>
    }
  }

  return isDesktop ? (
    <Dialog>
      <DialogTrigger asChild>{ui.trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ui.content.title}</DialogTitle>
          <DialogDescription>{ui.content.description}</DialogDescription>
        </DialogHeader>
        {ui.content.body}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer>
      <DrawerTrigger asChild>{ui.trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{ui.content.title}</DrawerTitle>
          <DrawerDescription>{ui.content.description}</DrawerDescription>
        </DrawerHeader>
        {ui.content.body}
      </DrawerContent>
    </Drawer>
  )
}
