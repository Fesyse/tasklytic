import { Plus } from "lucide-react"
import { Suspense } from "react"
import {
  GlowingStarsBackgroundCard,
  GlowingStarsDescription,
  GlowingStarsTitle
} from "@/components/ui/glowing-stars"
import { CreateNoteButtonWrapper } from "./create-note-button-wrapper"
import { NoteCard, NoteCardSkeleton } from "./note-card"
import { NotesDashboardHeader } from "./notes-dashboard-header"
import { ProjectsProps } from "@/app/(dashboard)/projects/[projectId]/page"
import { glowingStarsOnHover_PLUS_SMALL } from "@/lib/glowing-stars"
import { api } from "@/trpc/server"

async function NotesList({ projectId }: { projectId: string }) {
  const notes = await api.notes.getAll({ projectId })

  const pinnedNotes = notes.filter(note => note.isPinned)
  const unpinnedNotes = notes.filter(note => !note.isPinned)

  return (
    <>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Pinned Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pinnedNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">All Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unpinnedNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
        <CreateNoteButtonWrapper className="mt-6">
          <GlowingStarsBackgroundCard
            stars={85}
            className="w-full pb-0"
            illustrationClassName="h-24"
            glowingStarsOnHover={glowingStarsOnHover_PLUS_SMALL}
          >
            <GlowingStarsTitle className="text-xl">
              Create new note
            </GlowingStarsTitle>
            <div className="flex items-end justify-between">
              <GlowingStarsDescription className="text-sm">
                New note where you can write down your thoughts and ideas.
              </GlowingStarsDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsla(0,0%,100%,.1)]">
                <Plus />
              </div>
            </div>
          </GlowingStarsBackgroundCard>
        </CreateNoteButtonWrapper>
      </div>
    </>
  )
}

export const NotesDashboard: React.FC<ProjectsProps> = async ({ params }) => {
  const { projectId } = await params

  return (
    <div className="container mx-auto p-6">
      <NotesDashboardHeader />
      <Suspense fallback={<NotesListSkeleton />}>
        <NotesList projectId={projectId} />
      </Suspense>
    </div>
  )
}

function NotesListSkeleton() {
  return (
    <>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Pinned Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">All Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  )
}
