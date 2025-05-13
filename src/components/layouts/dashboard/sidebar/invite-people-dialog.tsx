"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { UserRoundPlusIcon } from "lucide-react"
import { useState } from "react"
import { InvitePeopleForm } from "./invite-people-form"

export const InvitePeopleDialog = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog key="invite-people" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <UserRoundPlusIcon />
            <span>Invite people</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>
            Add more people into your organization
          </DialogDescription>
        </DialogHeader>
        <InvitePeopleForm />
      </DialogContent>
    </Dialog>
  )
}
