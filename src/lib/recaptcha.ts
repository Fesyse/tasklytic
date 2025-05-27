import { tryCatch } from "@/lib/utils"

export async function verifyRecaptchaToken(token: string) {
  async function verify() {
    const res = await fetch("/api/recaptcha", {
      method: "POST",
      body: JSON.stringify({ gRecaptchaToken: token }),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      }
    })
    if (!res.ok) {
      throw new Error("Failed to verify recaptcha")
    }

    return res.json() as Promise<{ success: boolean }>
  }

  return tryCatch(verify())
}

export async function verifyRecaptcha(
  executeRecaptcha: (action?: string) => Promise<string>,
  action?: string
) {
  const gRecaptchaToken = await executeRecaptcha(action)
  const { data: recaptchaData, error: recaptchaError } =
    await verifyRecaptchaToken(gRecaptchaToken)

  return { recaptchaData, recaptchaError }
}
