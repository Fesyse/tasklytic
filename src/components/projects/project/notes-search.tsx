"use client"

import { cn } from "@udecode/cn"
import debounce from "lodash.debounce"
import { FileIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"

export const NotesSearch = () => {
  const router = useRouter()
  const { projectId } = useParams<{ projectId: string }>()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const {
    data: notes,
    refetch,
    isRefetching
  } = api.notes.getAll.useQuery(
    { projectId },
    {
      enabled: !!value.length
    }
  )

  const search = useCallback(
    debounce<React.ChangeEventHandler<HTMLInputElement>>(e => {
      if (!e.target.value) return

      setValue(e.target.value)
    }, 300),
    []
  )

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  useEffect(() => {
    if (!value.length) return

    refetch()
  }, [value])

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search notes...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          onInput={search}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup
            heading="Similar notes"
            className={cn({ "gap-1": !(notes?.length && !isRefetching) })}
          >
            {notes?.length && !isRefetching
              ? notes?.map(note => (
                  <CommandItem
                    key={note.id}
                    value={note.title}
                    onSelect={() =>
                      runCommand(() =>
                        router.push(`/projects/${projectId}/note/${note.id}`)
                      )
                    }
                  >
                    <FileIcon className="mr-2 h-4 w-4" />
                    {note.title}
                  </CommandItem>
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <CommandItem key={i} asChild>
                    <Skeleton className="h-7" />
                  </CommandItem>
                ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
