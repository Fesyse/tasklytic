import type { Comment, Discussion, Note } from "@/lib/db-client"
import { siteConfig } from "@/lib/site-config"
import type { Block } from "@/server/db/schema"
import { expect, test } from "@playwright/test"
import type { Dexie, EntityTable } from "dexie"
import { extractTrpcResultFromSuperjsonResponse } from "./config/playwright-utils"

// Add a TypeScript declaration for window.dexieDB for Playwright context
// (This is only for type safety in the test file)
declare global {
  interface Window {
    Dexie?: Dexie
  }
}

/**
 * NOTE: For this test to work, you must expose dexieDB on window in your app:
 *   if (typeof window !== "undefined") window.dexieDB = dexieDB;
 */
test("syncs all notes and verifies local Dexie DB", async ({ page }) => {
  await page.goto(`/dashboard`)

  // Intercept the syncNotes tRPC request and wait for it
  const syncResponse = await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/trpc/sync.syncNotes") &&
      resp.request().method() === "POST"
  )

  const responseText = await syncResponse.text()
  const { deserializedResponse, tRPCResultJson } =
    extractTrpcResultFromSuperjsonResponse(responseText)

  let notes: Note[] = []
  if (deserializedResponse.result?.data) {
    notes = deserializedResponse.result.data
  } else if (
    deserializedResponse[2] &&
    deserializedResponse[2][0] &&
    deserializedResponse[2][0][0] &&
    Array.isArray(deserializedResponse[2][0][0])
  ) {
    notes = deserializedResponse[2][0][0]
  } else if (Array.isArray(deserializedResponse)) {
    notes = deserializedResponse
  }

  if (!notes || notes.length === 0) {
    console.error("Notes array is empty or not found after deserialization.", {
      deserializedResponse,
      tRPCResultJson
    })
    throw new Error("Failed to extract notes from tRPC response.")
  }

  expect(notes.length).toBeGreaterThan(0) // Ensure some notes were found

  await page.addScriptTag({
    url: "https://unpkg.com/dexie/dist/dexie.js"
  })
  await page.addScriptTag({
    content: `window.Dexie = Dexie`
  })
  // For each note, check it's in the local Dexie DB
  const allNotesExist = await page.evaluate(
    async ({ notes, siteConfig }) => {
      if (!window.Dexie) {
        throw new Error(
          "dexieDB not exposed on window - see comment above test"
        )
      }

      // Dexie is a class, but TypeScript may not recognize it as constructable if the type is not correct.
      // We can use 'any' to bypass the type error for test code.
      const dexieDB = new (window as any).Dexie(
        `${siteConfig.name}Database`
      ) as Dexie & {
        notes: EntityTable<Note, "id">
        blocks: EntityTable<Block, "id">
        discussions: EntityTable<Discussion, "id">
        comments: EntityTable<Comment, "id">
      }

      dexieDB.version(1).stores({
        notes:
          "&id, title, emoji, emojiSlug, isPublic, organizationId, parentNoteId, updatedByUserId, updatedByUserName, updatedAt, createdByUserId, createdByUserName, createdAt, isFavorited, favoritedByUserId, cover, [id+organizationId], isDeleted",
        blocks: "&id, noteId, content, order",
        discussions:
          "&id, noteId, blockId, isResolved, userId, updatedAt, createdAt",
        comments: "&id, discussionId, userId, updatedAt, createdAt, isEdited"
      })

      const results = []
      for (const note of notes) {
        try {
          const found = await dexieDB.notes.get(note.id)
          results.push(!!found)
        } catch (error) {
          console.error(`Error checking note ${note.id}:`, error)
          results.push(false)
        }
      }
      return results.every((exists) => exists)
    },
    { notes, siteConfig }
  )

  expect(allNotesExist).toBe(true)
})

/**
 * NOTE: For this test to work, you must expose dexieDB on window in your app:
 *   if (typeof window !== "undefined") window.dexieDB = dexieDB;
 */
test("syncs all notes and verifies local Dexie DB already with some notes in local db", async ({
  page
}) => {
  await page.goto(`/dashboard`)

  // Intercept the syncNotes tRPC request and wait for it
  const syncResponse = await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/trpc/sync.syncNotes") &&
      resp.request().method() === "POST"
  )

  const responseText = await syncResponse.text()
  const { deserializedResponse, tRPCResultJson } =
    extractTrpcResultFromSuperjsonResponse(responseText)

  let notes: Note[] = []
  if (deserializedResponse.result?.data) {
    notes = deserializedResponse.result.data
  } else if (
    deserializedResponse[2] &&
    deserializedResponse[2][0] &&
    deserializedResponse[2][0][0] &&
    Array.isArray(deserializedResponse[2][0][0])
  ) {
    notes = deserializedResponse[2][0][0]
  } else if (Array.isArray(deserializedResponse)) {
    notes = deserializedResponse
  }

  if (!notes || notes.length === 0) {
    console.error("Notes array is empty or not found after deserialization.", {
      deserializedResponse,
      tRPCResultJson
    })
    throw new Error("Failed to extract notes from tRPC response.")
  }

  expect(notes.length).toBeGreaterThan(0) // Ensure some notes were found

  await page.addScriptTag({
    url: "https://unpkg.com/dexie/dist/dexie.js"
  })
  await page.addScriptTag({
    content: `window.Dexie = Dexie`
  })
  // For each note, check it's in the local Dexie DB
  const allNotesExist = await page.evaluate(
    async ({ notes, siteConfig }) => {
      if (!window.Dexie) {
        throw new Error(
          "dexieDB not exposed on window - see comment above test"
        )
      }

      // Dexie is a class, but TypeScript may not recognize it as constructable if the type is not correct.
      // We can use 'any' to bypass the type error for test code.
      const dexieDB = new (window as any).Dexie(
        `${siteConfig.name}Database`
      ) as Dexie & {
        notes: EntityTable<Note, "id">
        blocks: EntityTable<Block, "id">
        discussions: EntityTable<Discussion, "id">
        comments: EntityTable<Comment, "id">
      }

      dexieDB.version(1).stores({
        notes:
          "&id, title, emoji, emojiSlug, isPublic, organizationId, parentNoteId, updatedByUserId, updatedByUserName, updatedAt, createdByUserId, createdByUserName, createdAt, isFavorited, favoritedByUserId, cover, [id+organizationId], isDeleted",
        blocks: "&id, noteId, content, order",
        discussions:
          "&id, noteId, blockId, isResolved, userId, updatedAt, createdAt",
        comments: "&id, discussionId, userId, updatedAt, createdAt, isEdited"
      })

      const results = []
      for (const note of notes) {
        try {
          const found = await dexieDB.notes.get(note.id)
          results.push(!!found)
        } catch (error) {
          console.error(`Error checking note ${note.id}:`, error)
          results.push(false)
        }
      }
      return results.every((exists) => exists)
    },
    { notes, siteConfig }
  )

  expect(allNotesExist).toBe(true)
})
