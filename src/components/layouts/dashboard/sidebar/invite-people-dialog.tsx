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
import { useTranslations } from "next-intl"
import { useState } from "react"
import { InvitePeopleForm } from "./invite-people-form"

export const InvitePeopleDialog = () => {
  const t = useTranslations("Dashboard.Sidebar.NavSecondary")
  const [open, setOpen] = useState(false)

  return (
    <Dialog key="invite-people" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <UserRoundPlusIcon />
            <span>{t("invitePeople")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-96">
        <DialogHeader>
          <DialogTitle>{t("invitePeople")}</DialogTitle>
          <DialogDescription>
            Add more people into your organization
          </DialogDescription>
        </DialogHeader>
        <InvitePeopleForm />
      </DialogContent>
    </Dialog>
  )
}
