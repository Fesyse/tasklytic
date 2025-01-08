"use client"

import { cn } from "@udecode/cn"
import debounce from "lodash.debounce"
import { FileIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React, { useCallback, useState } from "react"
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

  const [isTyped, setIsTyped] = useState(false)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const { data: notes, isRefetching } = api.notes.getAll.useQuery(
    { projectId, filters: { search: value ?? undefined } },
    {
      enabled: true
    }
  )

  const search = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target

      if (
        value &&
        notes &&
        notes.map(note => note.title).some(title => title.includes(value))
      ) {
        console.log(notes, value)
        return
      } else setValue(e.target.value)
    }, 444),
    []
  )

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
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (!isTyped) setIsTyped(true)
            search(e)
          }}
        />
        <CommandList>
          {isTyped ? (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Similar notes">
                {isRefetching || !notes
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <CommandItem key={i} asChild>
                        <Skeleton className="h-11 animate-pulse rounded bg-primary/10 mb-2" />
                      </CommandItem>
                    ))
                  : notes.length
                    ? notes?.map(note => (
                        <CommandItem
                          key={note.id}
                          value={note.title}
                          onSelect={() => {
                            setOpen(false)
                            router.push(
                              `/projects/${projectId}/note/${note.id}`
                            )
                          }}
                        >
                          {note.emoji ? (
                            <span className="text-xl">{note.emoji}</span>
                          ) : (
                            <FileIcon />
                          )}
                          {note.title}
                        </CommandItem>
                      ))
                    : null}
              </CommandGroup>
            </>
          ) : (
            <p className="py-6 text-center text-sm">
              Start typing to search...
            </p>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
