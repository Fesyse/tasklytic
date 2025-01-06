import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotesFitlerForm } from "./notes-filter-form"

export function NotesDashboardHeader() {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
      <div className="flex w-full md:w-1/3">
        <Input placeholder="Search notes..." className="mr-2" />
        <Button size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <NotesFitlerForm />
    </div>
  )
}
