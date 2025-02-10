import { api } from "@/trpc/react"

export const useRevalidateSidebar = (projectId: string) => {
  const utils = api.useUtils()

  return () => {
    return Promise.all([
      utils.folders.getWorkspace.invalidate({ projectId }),
      utils.notes.getAll.invalidate({ projectId }),
      utils.notes.getAllRoot.invalidate({ projectId }),
      utils.navigation.getSidebar.invalidate({ projectId })
    ])
  }
}
