"use client"

import debounce from "lodash.debounce"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"

export const NotesSearch = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { projectId } = useParams<{ projectId: string }>()

  const search = useCallback(
    debounce<React.ChangeEventHandler<HTMLInputElement>>(e => {
      router.push(
        `/projects/${projectId}?${searchParams}&search=${e.target.value}`
      )
    }, 300),
    []
  )

  return (
    <div className="flex w-full md:w-1/3">
      <Input placeholder="Search notes..." className="mr-2" onChange={search} />
    </div>
  )
}
