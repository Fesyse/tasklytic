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
  if (!jsonLines.length) return { deserializedResponse: null, tRPCResultJson }

  if (jsonLines.length > 1) {
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
  } else {
    const parsedLine = JSON.parse(jsonLines[0]!)

    if (parsedLine?.result?.data) {
      tRPCResultJson = parsedLine.result.data
    } else if (parsedLine[0]?.result?.data?.json) {
      tRPCResultJson = parsedLine[0].result.data.json
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
