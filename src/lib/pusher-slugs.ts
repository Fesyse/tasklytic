export const getNoteSlug = (projectId: string, noteId: string) => {
  return `project.${projectId}.note.${noteId}`
}
