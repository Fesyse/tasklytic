"use client"

import { usePathname } from "next/navigation"
import { NoteNavActions } from "./note-nav-actions"

export const FloatingActions = () => {
  const pathname = usePathname()

  const isNotePage = pathname.startsWith("/dashboard/note/")

  if (!isNotePage) return null

  return (
    <div className="fixed top-2 right-2 max-w-[300px]">
      <NoteNavActions />
    </div>
  )
}
