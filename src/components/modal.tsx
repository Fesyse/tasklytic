"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type FC, type PropsWithChildren } from "react"
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle
} from "@/components/ui/credenza"

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
    <Credenza open={open} onOpenChange={handleOpenChange}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{title}</CredenzaTitle>
          {description ? (
            <CredenzaDescription>{description}</CredenzaDescription>
          ) : null}
        </CredenzaHeader>
        {children}
      </CredenzaContent>
    </Credenza>
  )
}
