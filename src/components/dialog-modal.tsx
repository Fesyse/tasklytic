"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type FC, type PropsWithChildren } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type DialogModalProps = {
  title: React.ReactNode
  description?: React.ReactNode
  className?: string
  showHeader: boolean
}

export const DialogModal: FC<PropsWithChildren<DialogModalProps>> = ({
  children,
  title,
  showHeader,
  className,
  ...props
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
      <DialogContent className={className}>
        <DialogHeader
          className={cn({
            hidden: showHeader === false
          })}
        >
          <DialogTitle>{title}</DialogTitle>
          {"description" in props ? (
            <DialogDescription>{props.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
