"use client"

import { useSearchParams } from "next/navigation"
import React, { useEffect } from "react"
import { toast } from "sonner"

export const AuthToastProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const searchParams = useSearchParams()
  const searchParamsAsString = searchParams.toString()

  useEffect(() => {
    setTimeout(() => {
      if (searchParams.get("fromSignIn")) {
        toast.success("Successfully signed in.")
      }
    })
  }, [searchParamsAsString])

  return children
}
