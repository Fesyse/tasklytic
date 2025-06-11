import { LOCALE_COOKIE_NAME } from "@/lib/locale"
import { tryCatch } from "@/lib/utils"
import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as "en" | "ru")) {
    const newLocale = (await cookies()).get(LOCALE_COOKIE_NAME)?.value

    locale = newLocale ?? routing.defaultLocale
  }

  const { data: importedMesages, error } = await tryCatch(
    (async () => {
      try {
        const res = await import(`../../messages/${locale}.json`)
        return res.default
      } catch {
        const res = await import(`../../messages/en.json`)
        locale = "en"
        return res.default
      }
    })()
  )

  if (error) {
    console.error("[LANGUAGE REQUEST] error: ", error)
  }

  return {
    locale,
    messages: importedMesages
  }
})
