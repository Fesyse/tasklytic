import type { Page } from "@playwright/test"

export type SeedData = {
  notes?: any[]
  blocks?: any[]
  discussions?: any[]
  comments?: any[]
}

export async function seedClientState(
  page: Page,
  { notes = [], blocks = [], discussions = [], comments = [] }: SeedData
) {
  await page.evaluate(
    ({ notes, blocks, discussions, comments }) => {
      window.dexieDB.notes.clear()
      window.dexieDB.blocks.clear()
      window.dexieDB.discussions.clear()
      window.dexieDB.comments.clear()
      if (notes.length) window.dexieDB.notes.bulkPut(notes)
      if (blocks.length) window.dexieDB.blocks.bulkPut(blocks)
      if (discussions.length) window.dexieDB.discussions.bulkPut(discussions)
      if (comments.length) window.dexieDB.comments.bulkPut(comments)
    },
    { notes, blocks, discussions, comments }
  )
}
