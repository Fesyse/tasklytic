import type { Page } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"

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
