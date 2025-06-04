import type { Comment, Discussion, Note } from "@/lib/db-client"
import { siteConfig } from "@/lib/site-config"
import type { Block } from "@/server/db/schema"
import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import type { Dexie, EntityTable } from "dexie"
import { extractTrpcResultFromSuperjsonResponse } from "./config/playwright-utils"

// Add a TypeScript declaration for window.dexieDB for Playwright context
// (This is only for type safety in the test file)
declare global {
  interface Window {
    Dexie?: Dexie
    dexieDB?: any
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

// Helper to mock tRPC syncNotes endpoint
async function mockTrpcRoute(page: Page, method: string, responseData: any[]) {
  await page.route(`**/api/trpc/${method}?batch=1`, (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        {
          result: {
            data: { json: responseData },
            meta: { values: {} }
          }
        }
      ]),
      headers: { "Content-Type": "application/json" }
    })
  })
}

// --- SYNC TESTS FOR ALL MAJOR SCENARIOS ---

test("syncs when client has no notes, server has notes", async ({ page }) => {
  await page.goto(`/dashboard`)

  await page.addScriptTag({ url: "https://unpkg.com/dexie/dist/dexie.js" })
  await page.addScriptTag({
    content: `window.Dexie = Dexie; if (!window.dexieDB) { window.dexieDB = new Dexie('${siteConfig.name}Database'); window.dexieDB.version(1).stores({ notes: '&id, title, emoji, emojiSlug, isPublic, organizationId, parentNoteId, updatedByUserId, updatedByUserName, updatedAt, createdByUserId, createdByUserName, createdAt, isFavorited, favoritedByUserId, cover, [id+organizationId], isDeleted', blocks: '&id, noteId, content, order', discussions: '&id, noteId, blockId, isResolved, userId, updatedAt, createdAt', comments: '&id, discussionId, userId, updatedAt, createdAt, isEdited' }) }`
  })
  await page.evaluate(() => window.dexieDB.notes.clear())
  // Mock server to return notes
  await mockTrpcRoute(page, "sync.syncNotes", [
    {
      id: "1",
      title: "Server Note",
      organizationId: "org1",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedByUserId: "u1",
      updatedByUserName: "User 1",
      createdByUserId: "u1",
      createdByUserName: "User 1",
      isPublic: false,
      parentNoteId: null
    }
  ])
  const notes = await page.evaluate(() => window.dexieDB.notes.toArray())
  expect(notes.length).toBe(1)
  expect(notes[0].title).toBe("Server Note")
})

test("syncs when client has some notes, server has all notes", async ({
  page
}) => {
  await page.goto(`/dashboard`)

  await page.addScriptTag({ url: "https://unpkg.com/dexie/dist/dexie.js" })
  await page.addScriptTag({
    content: `window.Dexie = Dexie; if (!window.dexieDB) { window.dexieDB = new Dexie('${siteConfig.name}Database'); window.dexieDB.version(1).stores({ notes: '&id, title, emoji, emojiSlug, isPublic, organizationId, parentNoteId, updatedByUserId, updatedByUserName, updatedAt, createdByUserId, createdByUserName, createdAt, isFavorited, favoritedByUserId, cover, [id+organizationId], isDeleted', blocks: '&id, noteId, content, order', discussions: '&id, noteId, blockId, isResolved, userId, updatedAt, createdAt', comments: '&id, discussionId, userId, updatedAt, createdAt, isEdited' }); }`
  })
  await page.evaluate(() =>
    window.dexieDB.notes.bulkPut([
      {
        id: "1",
        title: "Note 1",
        organizationId: "org1",
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedByUserId: "u1",
        updatedByUserName: "User 1",
        createdByUserId: "u1",
        createdByUserName: "User 1",
        isPublic: false,
        parentNoteId: null
      }
    ])
  )
  // Mock server to return all notes
  await mockTrpcRoute(page, "sync.syncNotes", [
    {
      id: "1",
      title: "Note 1",
      organizationId: "org1",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedByUserId: "u1",
      updatedByUserName: "User 1",
      createdByUserId: "u1",
      createdByUserName: "User 1",
      isPublic: false,
      parentNoteId: null
    },
    {
      id: "2",
      title: "Note 2",
      organizationId: "org1",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedByUserId: "u2",
      updatedByUserName: "User 2",
      createdByUserId: "u2",
      createdByUserName: "User 2",
      isPublic: false,
      parentNoteId: null
    }
  ])
  const notes = await page.evaluate(() => window.dexieDB.notes.toArray())
  expect(notes.length).toBe(2)
})

test("syncs when client has old data, server has newer data", async ({
  page
}) => {
  await page.goto(`/dashboard`)

  await page.addScriptTag({ url: "https://unpkg.com/dexie/dist/dexie.js" })
  await page.addScriptTag({
    content: `window.Dexie = Dexie; if (!window.dexieDB) { window.dexieDB = new Dexie('${siteConfig.name}Database'); window.dexieDB.version(1).stores({ notes: '&id, title, emoji, emojiSlug, isPublic, organizationId, parentNoteId, updatedByUserId, updatedByUserName, updatedAt, createdByUserId, createdByUserName, createdAt, isFavorited, favoritedByUserId, cover, [id+organizationId], isDeleted', blocks: '&id, noteId, content, order', discussions: '&id, noteId, blockId, isResolved, userId, updatedAt, createdAt', comments: '&id, discussionId, userId, updatedAt, createdAt, isEdited' }); }`
  })
  await page.evaluate(() =>
    window.dexieDB.notes.bulkPut([
      {
        id: "1",
        title: "Old Note",
        organizationId: "org1",
        updatedAt: new Date("2020-01-01").toISOString(),
        createdAt: new Date("2020-01-01").toISOString(),
        updatedByUserId: "u1",
        updatedByUserName: "User 1",
        createdByUserId: "u1",
        createdByUserName: "User 1",
        isPublic: false,
        parentNoteId: null
      }
    ])
  )
  // Mock server to return newer notes
  await mockTrpcRoute(page, "sync.syncNotes", [
    {
      id: "1",
      title: "New Note",
      organizationId: "org1",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedByUserId: "u1",
      updatedByUserName: "User 1",
      createdByUserId: "u1",
      createdByUserName: "User 1",
      isPublic: false,
      parentNoteId: null
    }
  ])
  const note = await page.evaluate(() => window.dexieDB.notes.get("1"))
  expect(note.title).toBe("New Note")
  expect(new Date(note.updatedAt).getFullYear()).toBeGreaterThan(2020)
})

test("syncs when server has old data, client has newer data", async ({
  page
}) => {
  await page.goto(`/dashboard`)

  await page.addScriptTag({ url: "https://unpkg.com/dexie/dist/dexie.js" })
  await page.addScriptTag({
    content: `window.Dexie = Dexie; if (!window.dexieDB) { window.dexieDB = new Dexie('${siteConfig.name}Database'); window.dexieDB.version(1).stores({ notes: '&id, title, emoji, emojiSlug, isPublic, organizationId, parentNoteId, updatedByUserId, updatedByUserName, updatedAt, createdByUserId, createdByUserName, createdAt, isFavorited, favoritedByUserId, cover, [id+organizationId], isDeleted', blocks: '&id, noteId, content, order', discussions: '&id, noteId, blockId, isResolved, userId, updatedAt, createdAt', comments: '&id, discussionId, userId, updatedAt, createdAt, isEdited' }); }`
  })
  await page.evaluate(() =>
    window.dexieDB.notes.bulkPut([
      {
        id: "1",
        title: "New Note",
        organizationId: "org1",
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedByUserId: "u1",
        updatedByUserName: "User 1",
        createdByUserId: "u1",
        createdByUserName: "User 1",
        isPublic: false,
        parentNoteId: null
      }
    ])
  )
  // Mock server to return old notes
  await mockTrpcRoute(page, "sync.syncNotes", [
    {
      id: "1",
      title: "Old Note",
      organizationId: "org1",
      updatedAt: new Date("2020-01-01").toISOString(),
      createdAt: new Date("2020-01-01").toISOString(),
      updatedByUserId: "u1",
      updatedByUserName: "User 1",
      createdByUserId: "u1",
      createdByUserName: "User 1",
      isPublic: false,
      parentNoteId: null
    }
  ])
  const note = await page.evaluate(() => window.dexieDB.notes.get("1"))
  expect(note.title).toBe("Old Note")
  expect(new Date(note.updatedAt).getFullYear()).toBe(2020)
})

test("syncs when server has some notes, client has all notes", async ({
  page
}) => {
  await page.goto(`/dashboard`)

  await page.addScriptTag({ url: "https://unpkg.com/dexie/dist/dexie.js" })
  await page.addScriptTag({
    content: `window.Dexie = Dexie; if (!window.dexieDB) { window.dexieDB = new Dexie('${siteConfig.name}Database'); window.dexieDB.version(1).stores({ notes: '&id, title, emoji, emojiSlug, isPublic, organizationId, parentNoteId, updatedByUserId, updatedByUserName, updatedAt, createdByUserId, createdByUserName, createdAt, isFavorited, favoritedByUserId, cover, [id+organizationId], isDeleted', blocks: '&id, noteId, content, order', discussions: '&id, noteId, blockId, isResolved, userId, updatedAt, createdAt', comments: '&id, discussionId, userId, updatedAt, createdAt, isEdited' }); }`
  })
  await page.evaluate(() =>
    window.dexieDB.notes.bulkPut([
      {
        id: "1",
        title: "Note 1",
        organizationId: "org1",
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedByUserId: "u1",
        updatedByUserName: "User 1",
        createdByUserId: "u1",
        createdByUserName: "User 1",
        isPublic: false,
        parentNoteId: null
      },
      {
        id: "2",
        title: "Note 2",
        organizationId: "org1",
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedByUserId: "u1",
        updatedByUserName: "User 1",
        createdByUserId: "u1",
        createdByUserName: "User 1",
        isPublic: false,
        parentNoteId: null
      }
    ])
  )
  // Mock server to return only some notes
  await mockTrpcRoute(page, "sync.syncNotes", [
    {
      id: "1",
      title: "Note 1",
      organizationId: "org1",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedByUserId: "u1",
      updatedByUserName: "User 1",
      createdByUserId: "u1",
      createdByUserName: "User 1",
      isPublic: false,
      parentNoteId: null
    }
  ])
  const notes = await page.evaluate(() => window.dexieDB.notes.toArray())
  expect(notes.length).toBe(1)
  expect(notes[0].id).toBe("1")
})

test("syncs when server has no notes, client has notes", async ({ page }) => {
  await page.goto(`/dashboard`)

  await page.addScriptTag({ url: "https://unpkg.com/dexie/dist/dexie.js" })
  await page.addScriptTag({
    content: `window.Dexie = Dexie; if (!window.dexieDB) { window.dexieDB = new Dexie('${siteConfig.name}Database'); window.dexieDB.version(1).stores({ notes: '&id, title, emoji, emojiSlug, isPublic, organizationId, parentNoteId, updatedByUserId, updatedByUserName, updatedAt, createdByUserId, createdByUserName, createdAt, isFavorited, favoritedByUserId, cover, [id+organizationId], isDeleted', blocks: '&id, noteId, content, order', discussions: '&id, noteId, blockId, isResolved, userId, updatedAt, createdAt', comments: '&id, discussionId, userId, updatedAt, createdAt, isEdited' }); }`
  })
  await page.evaluate(() =>
    window.dexieDB.notes.bulkPut([
      {
        id: "1",
        title: "Note 1",
        organizationId: "org1",
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedByUserId: "u1",
        updatedByUserName: "User 1",
        createdByUserId: "u1",
        createdByUserName: "User 1",
        isPublic: false,
        parentNoteId: null
      }
    ])
  )
  // Mock server to return no notes
  await mockTrpcRoute(page, "sync.syncNotes", [])
  const notes = await page.evaluate(() => window.dexieDB.notes.toArray())
  expect(notes.length).toBe(0)
})

// --- END SYNC TESTS ---
