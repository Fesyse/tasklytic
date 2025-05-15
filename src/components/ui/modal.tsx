"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type FC, type PropsWithChildren } from "react"

type ModalProps = {
  title: React.ReactNode
  description?: React.ReactNode
}

export const Modal: FC<PropsWithChildren<ModalProps>> = ({
  children,
  title,
  description
}) => {
  const [isFirstRender, setIsFirstRender] = useState(false)
  const [open, setOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const handleOpenChange = () => router.back()

  useEffect(() => {
    if (isFirstRender) setOpen(false)
    else setIsFirstRender(true)
  }, [pathname])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
