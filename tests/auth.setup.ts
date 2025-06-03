import { test as setup } from "@playwright/test"
import * as path from "path"
import { createScreenshot } from "./config/playwright-utils"

const authFile = path.join(process.cwd(), "./playwright/.auth/session.json")

setup("authenticate", async ({ browser, page }) => {
  await page.goto("/auth/sign-in")

  await page.waitForTimeout(5000)
  await page.$('iframe[src*="captcha"]')

  await page.fill('input[name="email"]', process.env.TESTING_LOGIN_EMAIL!)
  await page.fill('input[name="password"]', process.env.TESTING_LOGIN_PASSWORD!)
  await page.click('button[type="submit"]')

  await createScreenshot(page)

  await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/auth/sign-in/email") &&
      resp.request().method() === "POST"
  )

  // Extract the 'better-auth.session_data' cookie from the current context
  const cookies = await page.context().cookies()
  const betterAuthDataCookie = cookies.find(
    (c) => c.name === "better-auth.session_data"
  )
  const betterAuthTokenCookie = cookies.find(
    (c) => c.name === "better-auth.session_token"
  )

  if (!betterAuthDataCookie || !betterAuthTokenCookie) {
    throw new Error(
      `better-auth.session_${betterAuthDataCookie ? "data" : "token"} cookie not found after login`
    )
  }

  const betterAuthCookies = [betterAuthDataCookie, betterAuthTokenCookie]
  console.log(JSON.stringify(betterAuthCookies))

  // Create a new context and set the cookie with all required fields
  const browserContext = await browser.newContext()
  await browserContext.addCookies(
    betterAuthCookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      domain: "localhost",
      path: cookie.path,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite
    }))
  )

  await browserContext.storageState({ path: authFile })
})
