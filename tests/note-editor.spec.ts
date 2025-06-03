import type { Comment, Discussion, Note } from "@/lib/db-client"
import { siteConfig } from "@/lib/site-config"
import type { Block } from "@/server/db/schema"
import { expect, test } from "@playwright/test"
import type { Dexie, EntityTable } from "dexie"
import SuperJSON from "superjson"

// Add a TypeScript declaration for window.dexieDB for Playwright context
// (This is only for type safety in the test file)
declare global {
  interface Window {
    dexieDB?: {
      notes: {
        get: (id: string) => Promise<any>
      }
    }
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
  console.log("Full syncResponse.text():\n", responseText)

  // SuperJSON responses, especially when streamed/batched, can be tricky.
  // We need to find the specific JSON object that represents the actual result
  // from the `syncNotes` procedure.
  const jsonLines = responseText.split("\n").filter(Boolean)
  let tRPCResultJson: any = null

  // Iterate through lines to find the primary tRPC result object.
  // It's typically the one containing `result` or `data` at a higher level,
  // and also the `meta` object from SuperJSON.
  for (const line of jsonLines) {
    try {
      const parsedLine = JSON.parse(line)
      // Look for the line that contains the actual tRPC result data structure,
      // which is usually wrapped under `json` and has `meta` for SuperJSON.
      // The structure observed was: {"json":[...],"meta":{...}}
      // And the actual data is deep inside that `json` array.
      if (parsedLine.json && parsedLine.meta) {
        // This is likely the line containing the full superjson-transformed payload.
        // However, the `syncResponse.text()` you provided also shows intermediate
        // SuperJSON "patches" before the final data.
        // The actual data object you want might be under `json[2][0][0].data[0]`
        // or sometimes it's simpler like `json.result.data`.
        // Let's try to capture the most complex-looking one with `meta`.
        // And if `parsedLine.json` starts with an array of numbers like `[2,0,...]`
        // it's probably one of the stream patches, so we check for `parsedLine.json[2][0][0].data
        if (
          Array.isArray(parsedLine.json) &&
          parsedLine.json[2] &&
          parsedLine.json[2][0] &&
          parsedLine.json[2][0][0]
        ) {
          tRPCResultJson = parsedLine // Store this full object
        } else if (parsedLine.result?.data) {
          // Sometimes tRPC single responses come directly as {result: {data: ...}}
          tRPCResultJson = parsedLine
        }
      }
    } catch {
      // Ignore lines that aren't valid JSON
      continue
    }
  }

  if (!tRPCResultJson) {
    throw new Error(
      "Could not find the main tRPC result JSON object in the response."
    )
  }

  // Now, use SuperJSON to deserialize the entire complex object.
  // SuperJSON will handle the internal `json` and `meta` fields.
  const deserializedResponse = SuperJSON.deserialize(tRPCResultJson) as any

  let notes: any[] = []
  // Look for the actual data, which can be at `deserializedResponse.result.data`
  // or directly at the top level if it's the final return value.
  // Given the `json[2][0][0].data[0]` path, it's likely just an array here
  // after full SuperJSON deserialization.

  // If the `syncNotes` procedure returns `Array<Note>`, then `deserializedResponse` might directly be that array.
  // However, if the tRPC link still wraps it, it might be `deserializedResponse.result.data`.
  // Let's try the common tRPC client output format:
  if (deserializedResponse.result?.data) {
    notes = deserializedResponse.result.data
  } else if (Array.isArray(deserializedResponse)) {
    notes = deserializedResponse // If the procedure returns an array directly
  } else if (
    deserializedResponse[2] &&
    deserializedResponse[2][0] &&
    deserializedResponse[2][0][0] &&
    Array.isArray(deserializedResponse[2][0][0])
  ) {
    // This attempts to match the internal structure `json[2][0][0].data[0]`
    // but after full SuperJSON deserialization, it might look slightly different.
    // It's possible that `deserializedResponse` itself is the outer wrapper and
    // the notes are at `deserializedResponse[2][0][0].data[0]`
    notes = deserializedResponse[2][0][0]
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
  // For each note, check it's in the local Dexie DB
  const check = await page.evaluate(
    async ({ notes, siteConfig }) => {
      const dexieDB = new Dexie(`${siteConfig.name}Database`) as Dexie & {
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

      for (const note of notes) {
        const clientNote = await dexieDB.notes.get(note.id)
        if (!clientNote) return false
      }

      return true
    },
    { notes, siteConfig }
  )
  expect(check).toBe(true)
})

// 2. Syncing a note page (blocks, discussions, comments)
// test("syncs a note page: blocks, discussions, comments", async ({ page }) => {
//   await page.goto(APP_URL)

//   // TODO: Log in if authentication is required

//   // TODO: Navigate to a specific note page (replace with actual navigation)
//   // await page.click('[data-testid="note-list-item"]:nth-child(1)');

//   // TODO: Trigger sync for this note (find and click the sync button for the note)
//   // await page.click('[data-testid="sync-note"]');

//   // TODO: Wait for sync to complete
//   // await expect(page.locator('[data-testid="sync-status"]')).toHaveText('success');

//   // 2.1: Verify blocks are present and up-to-date
//   // const blocks = await page.locator('[data-testid="note-block"]').all();
//   // expect(blocks.length).toBeGreaterThan(0);

//   // 2.2: Verify discussions are present
//   // const discussions = await page.locator('[data-testid="discussion"]').all();
//   // expect(discussions.length).toBeGreaterThanOrEqual(0); // 0 or more

//   // 2.3: Verify comments for a discussion
//   // if (discussions.length > 0) {
//   //   await discussions[0].click(); // Expand first discussion
//   //   const comments = await page.locator('[data-testid="comment"]').all();
//   //   expect(comments.length).toBeGreaterThanOrEqual(0); // 0 or more
//   // }
// })

// // TODO: Add more granular tests for edge cases, error handling, and offline/online scenarios as needed.
