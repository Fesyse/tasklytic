import { NoteNavActions } from "./note-nav-actions"

export const FloatingActions = () => {
  return (
    <div className="fixed top-2 right-2 flex gap-6">
      <NoteNavActions />
    </div>
  )
}
