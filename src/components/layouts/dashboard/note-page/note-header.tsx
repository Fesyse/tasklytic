import { NoteBreadcrumbs } from "./note-breadcrumbs"
import { NoteNavActions } from "./note-nav-actions"

export const NoteHeader = () => {
  return (
    <header className="sticky top-0 left-0 flex w-full justify-between gap-6 p-4">
      <NoteBreadcrumbs />
      <div className="flex gap-6">
        <NoteNavActions />
      </div>
    </header>
  )
}
