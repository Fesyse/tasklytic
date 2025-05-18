"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { useNote } from "@/hooks/use-note"
import { authClient } from "@/lib/auth-client"
import { dexieDB, type Note } from "@/lib/db-client"
import { tryCatch } from "@/lib/utils"
import { useLiveQuery } from "dexie-react-hooks"
import { FileIcon, Slash } from "lucide-react"
import React, { useEffect, useState } from "react"

export const NoteBreadcrumbs = () => {
  const { data: note } = useNote()
  const { data: organization } = authClient.useActiveOrganization()
  const [noteIds, setNoteIds] = useState<string[]>([])

  // First, get the chain of note IDs that form the breadcrumb path
  useEffect(() => {
    const fetchNoteIds = async () => {
      if (!note || !organization) return

      try {
        const ids: string[] = []
        let currentNote: Note | undefined = note

        // Build the breadcrumb trail by traversing up the parent chain
        while (currentNote) {
          ids.unshift(currentNote.id)

          // If there's no parent, break the loop
          if (!currentNote.parentNoteId) break

          // Get the parent note directly from Dexie DB
          const parent: Note | undefined = await dexieDB.notes
            .where({
              id: currentNote.parentNoteId,
              organizationId: organization.id
            })
            .first()

          // If parent not found, break the loop
          if (!parent) break

          // Continue with the parent
          currentNote = parent
        }

        setNoteIds(ids)
      } catch (error) {
        console.error("Error fetching note IDs:", error)
      }
    }

    fetchNoteIds()
  }, [note?.id, organization?.id])

  // Then, use useLiveQuery to get the actual note data for these IDs
  // This will react to changes in any of the notes in the breadcrumb trail
  const breadcrumbs = useLiveQuery(
    async () => {
      if (!noteIds.length || !organization) return []

      // Get all notes in the breadcrumb trail at once
      const { data: notes, error } = await tryCatch(
        dexieDB.notes.where("id").anyOf(noteIds).toArray()
      )

      if (error) {
        console.error("Error fetching breadcrumb notes:", error)
        return []
      }

      // Sort them according to the original noteIds array order
      return noteIds
        .map((id) => notes?.find((note) => note.id === id))
        .filter((note): note is Note => note !== undefined)
    },
    [noteIds, organization?.id],
    [] // Default value when loading
  )

  // This will be true when the query is still running its first execution
  const isLoading = !breadcrumbs || breadcrumbs.length === 0

  if (isLoading || !note) {
    return null // Or return a skeleton loader
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.id}>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="flex items-center gap-2">
                  {breadcrumb.emoji ? (
                    <span>{breadcrumb.emoji}</span>
                  ) : (
                    <FileIcon className="text-muted-foreground size-4" />
                  )}
                  <span>
                    {breadcrumb.title?.length ? breadcrumb.title : "Untitled"}
                  </span>
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={`/dashboard/note/${breadcrumb.id}`}>
                  {breadcrumb.title?.length ? breadcrumb.title : "Untitled"}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
