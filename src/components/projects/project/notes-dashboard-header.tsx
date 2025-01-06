"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Search, SortAsc } from "lucide-react"

export function NotesDashboardHeader() {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
      <div className="flex w-full md:w-1/3">
        <Input placeholder="Search notes..." className="mr-2" />
        <Button size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex space-x-2">
        <Select defaultValue="updated">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="created">Created Date</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <SortAsc className="h-4 w-4 mr-2" />
          Sort
        </Button>
      </div>
    </div>
  )
}
