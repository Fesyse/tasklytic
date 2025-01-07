"use client"

import debounce from "lodash.debounce"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"

export const NotesSearch = () => {
  const search = useCallback(
    debounce<React.ChangeEventHandler<HTMLInputElement>>(e => {}, 300),
    []
  )

  return (
    <div className="flex w-full md:w-1/3">
      <Input placeholder="Search notes..." className="mr-2" onChange={search} />
    </div>
  )
}
