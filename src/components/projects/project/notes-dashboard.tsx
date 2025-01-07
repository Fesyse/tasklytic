import { Pin, Plus } from "lucide-react"
import { Suspense } from "react"
import {
  GlowingStarsBackgroundCard,
  GlowingStarsDescription,
  GlowingStarsTitle
} from "@/components/ui/glowing-stars"
import { CreateNoteButtonWrapper } from "./create-note-button-wrapper"
import { NoteCard, NoteCardSkeleton } from "./note-card"
import { NotesDashboardHeader } from "./notes-dashboard-header"
import { Filters } from "@/app/(dashboard)/projects/[projectId]/page"
import { glowingStarsOnHover_PLUS_SMALL } from "@/lib/glowing-stars"
import { api } from "@/trpc/server"

type NotesDashboardProps = {
  projectId: string
  filters: Filters | undefined
}

async function NotesList({ projectId, filters }: NotesDashboardProps) {
  const notes = await api.notes.getAll({ projectId, filters })

  const pinnedNotes = notes.filter(note => note.isPinned)
  const unpinnedNotes = notes.filter(note => !note.isPinned)

  return (
    <>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 flex gap-2 items-center">
          <Pin className="-rotate-45" /> Pinned Notes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pinnedNotes.length ? (
            pinnedNotes.map(note => <NoteCard key={note.id} note={note} />)
          ) : (
            <p className="text-muted-foreground">No pinned notes</p>
          )}
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">All Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unpinnedNotes.length ? (
            unpinnedNotes.map(note => <NoteCard key={note.id} note={note} />)
          ) : (
            <p className="text-muted-foreground">No notes</p>
          )}
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

export const NotesDashboard: React.FC<NotesDashboardProps> = async props => {
  return (
    <div className="container mx-auto p-6">
      <NotesDashboardHeader />
      <Suspense fallback={<NotesListSkeleton />}>
        <NotesList {...props} />
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
