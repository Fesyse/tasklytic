import { NotesDashboardHeader } from "@/components/projects/project/notes-dashboard-header"

export default function NoteDashboardLayout({
  children
}: React.PropsWithChildren) {
  return (
    <div className="container mx-auto p-6">
      <NotesDashboardHeader />
      {children}
    </div>
  )
}
