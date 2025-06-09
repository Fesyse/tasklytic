import { Button } from "@/components/ui/button"
import type { useSyncedNoteQueries } from "@/hooks/use-sync-queries"
import { authClient } from "@/lib/auth-client"
import type { Note } from "@/lib/db-client"
import { useQueryClient } from "@tanstack/react-query"
import { Star } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback } from "react"
import { toast } from "sonner"

// Favorite button component
type FavoriteButtonProps = {
  updateNoteFavorite: ReturnType<
    typeof useSyncedNoteQueries
  >["updateNoteFavorite"]
  note: Note | undefined
}

export const NoteFavoriteButton = ({
  updateNoteFavorite,
  note
}: FavoriteButtonProps) => {
  const t = useTranslations("Dashboard.Note.Editor.ContentHeader")
  const queryClient = useQueryClient()

  const { data: session } = authClient.useSession()
  const { data: organization } = authClient.useActiveOrganization()

  const handleToggleFavorite = useCallback(async () => {
    if (!note || !organization || !session) return

    const newFavoritedState = !note.isFavorited

    // Use the updateNoteFavorite from useSyncedNoteQueries hook
    updateNoteFavorite(
      newFavoritedState,
      newFavoritedState ? session.user.id : null
    )
      .then(({ error }) => {
        if (error) {
          toast.error("Failed to update favorite status")
          console.error(error)
          return
        }

        // Optimistically update the cache
        queryClient.setQueryData(
          ["note", note.id, organization.id],
          (old: Note) => ({
            ...old,
            isFavorited: newFavoritedState,
            favoritedByUserId: newFavoritedState ? session.user.id : null
          })
        )
      })
      .catch((error) => {
        toast.error("Failed to update favorite status")
        console.error(error)
      })
  }, [note, organization, session, updateNoteFavorite, queryClient])

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-xl"
      onClick={handleToggleFavorite}
    >
      <Star
        className={`mr-1 size-4 ${note?.isFavorited ? "fill-yellow-400 text-yellow-400" : ""}`}
      />
      {t("toggleFavorite", {
        isFavorited: note?.isFavorited ? "true" : "false"
      })}
    </Button>
  )
}
