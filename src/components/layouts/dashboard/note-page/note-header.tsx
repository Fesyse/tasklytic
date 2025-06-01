import { NoteBreadcrumbs } from "./note-breadcrumbs"
import { NoteNavActions } from "./note-nav-actions"

export const NoteHeader = () => {
  return (
    <header className="sticky top-0 left-0 flex w-full justify-between gap-6 p-3">
      <div className="flex shrink items-center gap-2 rounded p-1 backdrop-blur-lg">
        <NoteBreadcrumbs />
      </div>
      <div className="flex gap-2 rounded p-1 backdrop-blur-lg">
        <NoteNavActions />
      </div>
    </header>
  )
}
