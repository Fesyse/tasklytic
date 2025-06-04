import type { Page } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"
import SuperJSON from "superjson"

export const createScreenshot = async (page: Page) => {
  const screenshot = await page.screenshot()

  if (!fs.existsSync(path.join(process.cwd(), "tests"))) {
    fs.mkdirSync(path.join(process.cwd(), "tests", "temp"))
  }

  const screenshotFileName = path.join(
    process.cwd(),
    "tests",
    "temp",
    `${crypto.randomUUID()}.png`
  )
  fs.writeFileSync(screenshotFileName, screenshot)
}

/**
 * Extracts and deserializes the tRPC result from a SuperJSON response text.
 * Returns the deserialized response and the raw tRPC result JSON object.
 */
export function extractTrpcResultFromSuperjsonResponse(responseText: string) {
  const jsonLines = responseText.split("\n").filter(Boolean)
  let tRPCResultJson: any = null
  for (const line of jsonLines) {
    try {
      const parsedLine = JSON.parse(line)
      if (parsedLine.json && parsedLine.meta) {
        if (
          Array.isArray(parsedLine.json) &&
          parsedLine.json[2] &&
          parsedLine.json[2][0] &&
          parsedLine.json[2][0][0]
        ) {
          tRPCResultJson = parsedLine
        } else if (parsedLine.result?.data) {
          tRPCResultJson = parsedLine
        }
      }
    } catch {
      continue
    }
  }
  if (!tRPCResultJson) {
    throw new Error(
      "Could not find the main tRPC result JSON object in the response."
    )
  }
  const deserializedResponse = SuperJSON.deserialize(tRPCResultJson) as any
  return { deserializedResponse, tRPCResultJson }
}
