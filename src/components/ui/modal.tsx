"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useState, type FC, type PropsWithChildren } from "react"

type ModalProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}

export const Modal: FC<PropsWithChildren<ModalProps>> = ({
  children,
  title,
  description,
  className
}) => {
  const [open, setOpen] = useState(true)
  const router = useRouter()

  const handleOpenChange = () => {
    setOpen(false)
    router.back()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={className}>
        {title || description ? (
          <DialogHeader>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
        ) : null}
        {children}
      </DialogContent>
    </Dialog>
  )
}
