"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Search, SortAsc } from "lucide-react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
  TooltipProvider
} from "@/components/ui/tooltip"
import { TooltipTrigger } from "@/components/plate-ui/tooltip"
import {
  type NoteDashboardFilterSchema,
  noteDashboardFilterSchema,
  sortByWithLabel
} from "@/lib/schemas"

export function NotesDashboardHeader() {
  const form = useForm<NoteDashboardFilterSchema>({
    mode: "onChange",
    defaultValues: {
      order: "asc",
      sortBy: "updated"
    },
    resolver: zodResolver(noteDashboardFilterSchema)
  })

  const onSubmit = (data: NoteDashboardFilterSchema) => {
    console.log(data)
  }

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
      <div className="flex w-full md:w-1/3">
        <Input placeholder="Search notes..." className="mr-2" />
        <Button size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form className="flex space-x-2" onSubmit={form.handleSubmit(onSubmit)}>
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
          <FormField
            name="order"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
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
                </TooltipProvider>
              </FormItem>
            )}
          />

          <Button>
            <SortAsc className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </form>
      </Form>
    </div>
  )
}
