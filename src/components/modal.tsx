"use client"

import { useRouter } from "next/navigation"
import type { FC, PropsWithChildren } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle
} from "@/components/ui/dialog"

type ModalProps = {
  title: React.ReactNode
  description?: React.ReactNode
}

export const Modal: FC<PropsWithChildren<ModalProps>> = ({
  children,
  title,
  description
}) => {
  const router = useRouter()

  const handleOpenChange = () => router.back()

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-y-hidden">
        <DialogTitle>{title}</DialogTitle>
        {description ? (
          <DialogDescription>{description}</DialogDescription>
        ) : null}
        {children}
      </DialogContent>
    </Dialog>
  )
}
