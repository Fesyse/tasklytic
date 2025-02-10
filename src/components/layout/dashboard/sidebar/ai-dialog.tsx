"use client"

import { Sparkles } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export const AiDialog = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton isActive={open}>
            <Sparkles />
            Ask AI
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DialogTrigger>
      <DialogContent>\</DialogContent>
    </Dialog>
  )
}
