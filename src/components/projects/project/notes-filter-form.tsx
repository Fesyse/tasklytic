"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SortAsc, X } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  noteDashboardFilterSchema,
  NoteDashboardFilterSchema,
  sortByWithLabel
} from "@/lib/schemas"

export const NotesFilterForm = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { projectId } = useParams<{ projectId: string }>()

  const isSubmitted =
    searchParams.get("sortBy") !== null || searchParams.get("order") !== null

  const form = useForm<NoteDashboardFilterSchema>({
    defaultValues: {
      order: "asc",
      sortBy: "updatedAt"
    },
    resolver: zodResolver(noteDashboardFilterSchema)
  })

  const onSubmit = (data: NoteDashboardFilterSchema) => {
    const baseUrl = `/projects/${projectId}`

    router.push(`${baseUrl}?${new URLSearchParams(data)}`)
  }

  const resetFilters = () => {
    form.reset()
    router.push(`/projects/${projectId}`)
    router.refresh()
  }

  return (
    <Form {...form}>
      <form
        className="flex space-x-2 justify-between"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <TooltipProvider>
          <FormField
            name="sortBy"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortByWithLabel.map(item => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <div className="flex space-x-2">
            <FormField
              name="order"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() =>
                          field.onChange(field.value === "asc" ? "desc" : "asc")
                        }
                      >
                        {field.value === "asc" ? (
                          <SortAsc className="h-4 w-4" />
                        ) : (
                          <SortAsc className="h-4 w-4 rotate-180" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {field.value === "asc"
                        ? "Sort Ascending"
                        : "Sort Descending"}
                    </TooltipContent>
                  </Tooltip>
                </FormItem>
              )}
            />

            <Button>
              <SortAsc className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>
          {isSubmitted ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={resetFilters}
                >
                  <X size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset filters</TooltipContent>
            </Tooltip>
          ) : null}
        </TooltipProvider>
      </form>
    </Form>
  )
}
