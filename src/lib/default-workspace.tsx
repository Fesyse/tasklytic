import { type TElement } from "@udecode/plate-common"

type DefaultWorkspace = {
  notes: {
    title: string
    emoji: string

    blocks: TElement[]
  }[]
}

export const defaultWorkspace: DefaultWorkspace = {
  notes: [
    {
      title: "Welcome to Tasklytic!",
      emoji: "👋",
      blocks: [
        {
          type: "paragraph",
          children: [{ text: "This is your first note!" }]
        },
        {
          type: "paragraph",
          children: [
            {
              text: "You can create new notes by clicking the + button in the top right corner."
            }
          ]
        },
        {
          type: "paragraph",
          children: [
            {
              text: "You can also import notes from a JSON file by clicking the import button in the top right corner."
            }
          ]
        },
        {
          type: "heading-one",
          children: [{ text: "Features" }]
        },
        {
          type: "list-item",
          children: [{ text: "Create notes, folders, and tasks" }]
        },
        {
          type: "list-item",
          children: [{ text: "Organize notes into folders" }]
        },
        {
          type: "list-item",
          children: [{ text: "Add tasks to notes" }]
        }
      ]
    }
  ]
}
