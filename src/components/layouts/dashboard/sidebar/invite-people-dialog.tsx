"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { UserRoundPlusIcon } from "lucide-react"
import { useState } from "react"

export const InvitePeopleDialog = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger key="invite-people" asChild>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <UserRoundPlusIcon />
            <span>Invite people</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DialogTrigger>
      <DialogContent></DialogContent>
    </Dialog>
  )
}
