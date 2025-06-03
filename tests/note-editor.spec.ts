import { createDexieDB } from "@/lib/db-client"
import { expect, test, type Page } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"

// Helper: Go to the app's main page (adjust URL as needed)
const APP_URL = "http://localhost:3000" // TODO: adjust if needed

const createScreenshot = async (page: Page) => {
  const screenshot = await page.screenshot()
  const screenshotFileName = path.join(
    process.cwd(),
    "tests",
    "temp",
    `${crypto.randomUUID()}.png`
  )
  fs.writeFileSync(screenshotFileName, screenshot)
}

const login = async (page: Page) => {
  await page.waitForSelector("#turnstile-widget>div")

  await page.fill('input[name="email"]', process.env.TESTING_LOGIN_EMAIL!)
  await page.fill('input[name="password"]', process.env.TESTING_LOGIN_PASSWORD!)
  await page.click('button[type="submit"]')

  await createScreenshot(page)

  await page.waitForURL(`${APP_URL}/dashboard`)
}

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
  await page.goto(`${APP_URL}/auth/sign-in`)
  await login(page)
  throw new Error("asdasd")

  // Intercept the syncNotes tRPC request and wait for it
  const syncResponse = await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/trpc/sync.syncNotes") &&
      resp.request().method() === "POST"
  )

  // Parse the returned notes from the response
  const json = await syncResponse.json()
  console.log(json)
  // tRPC responses are usually { result: { data: { ... } } }
  const notes = json?.result?.result ?? []

  // For each note, check it's in the local Dexie DB
  const exists = await page.evaluate(async (notes) => {
    for (const note of notes) {
      const dexieDB = createDexieDB()
      const found = await dexieDB.notes.get(note.id)

      return !!found
    }
  }, notes)
  expect(exists).toBe(true)
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
