import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotesFilterForm } from "./notes-filter-form"
import { NotesSearch } from "./notes-search"

export function NotesDashboardHeader() {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" />
        <NotesSearch />
      </div>
      <NotesFilterForm />
    </div>
  )
}
