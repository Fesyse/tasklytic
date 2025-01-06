import { NotesFilterForm } from "./notes-filter-form"
import { NotesSearch } from "./notes-search"

export function NotesDashboardHeader() {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
      <NotesSearch />
      <NotesFilterForm />
    </div>
  )
}
